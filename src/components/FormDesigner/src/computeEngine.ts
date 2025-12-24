import type { FieldDefinition, TimeUnit, TimeUnitItem } from '@/components/FormDesigner'
import { watch, type WatchStopHandle } from 'vue'

/* =====================================================
 * 类型定义
 * ===================================================== */

export type RuntimeValue = number | string | boolean | Date | null

export type RuntimeContext = Record<string, RuntimeValue>

/* =====================================================
 * 依赖解析
 * ===================================================== */

const VARIABLE_REG = /[a-zA-Z_]\w*/g

/* =====================================================
 * 解析表达式并获取依赖字段名
 * ===================================================== */
export function extractDependencies(expression: string): string[] {
	const set = new Set<string>()
	const matches = expression.match(VARIABLE_REG) || []

	for (const m of matches) {
		if (!isReservedWord(m)) {
			set.add(m)
		}
	}
	return Array.from(set)
}

function isReservedWord(word: string) {
	return ['Math', 'now', 'addDays', 'daysBetween', 'true', 'false'].includes(word)
}

/* =====================================================
 * 依赖图
 * ===================================================== */

export function buildDependencyGraph(fields: FieldDefinition[]): Map<string, Set<string>> {
	const graph = new Map<string, Set<string>>()

	fields.forEach((field) => {
		if (!field.compute) return

		const deps =
			field.compute.dependsOn?.length > 0
				? field.compute.dependsOn
				: extractDependencies(field.compute.expression)

		graph.set(field.fieldName, new Set(deps))
	})

	return graph
}

/* =====================================================
 * 循环检测
 * ===================================================== */
export function detectCycle(graph: Map<string, Set<string>>): string[] | null {
	const visited = new Set<string>()
	const stack = new Set<string>()

	function dfs(node: string): string[] | null {
		if (stack.has(node)) return [node]
		if (visited.has(node)) return null

		visited.add(node)
		stack.add(node)

		const deps = graph.get(node)
		if (deps) {
			for (const dep of deps) {
				if (!graph.has(dep)) continue
				const cycle = dfs(dep)
				if (cycle) {
					cycle.push(node)
					return cycle
				}
			}
		}

		stack.delete(node)
		return null
	}

	for (const node of graph.keys()) {
		const cycle = dfs(node)
		if (cycle) return cycle.reverse()
	}

	return null
}

/* =====================================================
 * Tokenizer
 * ===================================================== */

type TokenType = 'number' | 'string' | 'identifier' | 'operator' | 'paren' | 'comma'

interface Token {
	type: TokenType
	value: string
}

/* =====================================================
 * 解析表达式
 * ===================================================== */
function tokenize(expr: string): Token[] {
	const tokens: Token[] = []
	const re =
		/\s*(>=|<=|==|!=|\|\||&&|[()+\-*/<>!,]|"(?:\\.|[^"])*"|\d+(?:\.\d+)?|[a-zA-Z_]\w*)\s*/g

	let m: RegExpExecArray | null
	while ((m = re.exec(expr))) {
		const v = m[1]
		if (/^\d/.test(v)) {
			tokens.push({ type: 'number', value: v })
		} else if (v.startsWith('"')) {
			tokens.push({ type: 'string', value: v.slice(1, -1) })
		} else if (v === '(' || v === ')') {
			tokens.push({ type: 'paren', value: v })
		} else if (v === ',') {
			tokens.push({ type: 'comma', value: v })
		} else if (
			['+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!=', '&&', '||', '!'].includes(v)
		) {
			tokens.push({ type: 'operator', value: v })
		} else {
			tokens.push({ type: 'identifier', value: v })
		}
	}
	return tokens
}

/* =====================================================
 * AST
 * ===================================================== */

type ASTNode =
	| { type: 'literal'; value: RuntimeValue }
	| { type: 'variable'; name: string }
	| { type: 'binary'; op: string; left: ASTNode; right: ASTNode }
	| { type: 'unary'; op: string; expr: ASTNode }
	| { type: 'call'; name: string; args: ASTNode[] }

/* =====================================================
 * Parser（递归下降）
 * ===================================================== */

function parse(tokens: Token[]): ASTNode {
	let pos = 0
	const peek = () => tokens[pos]
	const consume = () => tokens[pos++]

	function primary(): ASTNode {
		const t = consume()
		if (!t) throw new Error('Unexpected end')

		if (t.type === 'number') return { type: 'literal', value: Number(t.value) }
		if (t.type === 'string') return { type: 'literal', value: t.value }

		if (t.type === 'identifier') {
			if (peek()?.value === '(') {
				consume()
				const args: ASTNode[] = []
				if (peek()?.value !== ')') {
					do {
						args.push(expression())
					} while (peek()?.value === ',' && consume())
				}
				consume()
				return { type: 'call', name: t.value, args }
			}
			if (t.value === 'true') return { type: 'literal', value: true }
			if (t.value === 'false') return { type: 'literal', value: false }
			return { type: 'variable', name: t.value }
		}

		if (t.value === '(') {
			const e = expression()
			consume()
			return e
		}

		if (t.value === '!') {
			return { type: 'unary', op: '!', expr: primary() }
		}

		throw new Error('Invalid token')
	}

	function binary(next: () => ASTNode, ops: string[]): ASTNode {
		let node = next()
		while (peek() && ops.includes(peek().value)) {
			const op = consume().value
			node = { type: 'binary', op, left: node, right: next() }
		}
		return node
	}

	const mul = () => binary(primary, ['*', '/'])
	const add = () => binary(mul, ['+', '-'])
	const cmp = () => binary(add, ['>', '<', '>=', '<=', '==', '!='])
	const expression = () => binary(cmp, ['&&', '||'])

	return expression()
}

/* =====================================================
 * 运算 + 内置函数
 * ===================================================== */

const operators: Record<string, (a: any, b: any) => any> = {
	'+': (a, b) =>
		a instanceof Date && typeof b === 'number'
			? new Date(a.getTime() + b)
			: typeof a === 'number' && typeof b === 'number'
				? a + b
				: String(a ?? '') + String(b ?? ''),

	'-': (a, b) =>
		a instanceof Date && b instanceof Date
			? a.getTime() - b.getTime()
			: a instanceof Date && typeof b === 'number'
				? new Date(a.getTime() - b)
				: a - b,

	'*': (a, b) => a * b,
	'/': (a, b) => a / b,

	'>': (a, b) => (a instanceof Date && b instanceof Date ? a > b : a > b),
	'<': (a, b) => (a instanceof Date && b instanceof Date ? a < b : a < b),
	'>=': (a, b) => a >= b,
	'<=': (a, b) => a <= b,
	'==': (a, b) => (a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a == b),
	'!=': (a, b) => (a instanceof Date && b instanceof Date ? a.getTime() !== b.getTime() : a != b),
	'&&': (a, b) => a && b,
	'||': (a, b) => a || b,
}
type ComputeFunction = (...args: any[]) => any

const functions: Record<string, ComputeFunction> = {
	now: () => new Date(),
	addDays: (d: Date, days: number) => new Date(d.getTime() + days * 86400000),
	daysBetween: (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / 86400000),
}

/* =====================================================
 * 执行
 * ===================================================== */

function evaluate(ast: ASTNode, ctx: RuntimeContext): any {
	switch (ast.type) {
		case 'literal':
			return ast.value
		case 'variable':
			return ctx[ast.name]
		case 'unary':
			return !evaluate(ast.expr, ctx)
		case 'binary':
			return operators[ast.op](evaluate(ast.left, ctx), evaluate(ast.right, ctx))
		case 'call':
			return functions[ast.name as any](...ast.args.map((a) => evaluate(a, ctx)))
	}
}

/* =====================================================
 * 对外执行 API（替换 new Function）
 * ===================================================== */

export function evaluateExpression(expression: string, context: RuntimeContext) {
	try {
		const tokens = tokenize(expression)
		const ast = parse(tokens)
		return evaluate(ast, context)
	} catch (e) {
		console.warn('公式执行失败:', expression, e)
		return null
	}
}

/* =====================================================
 * Vue 计算引擎（升级版）
 * ===================================================== */

export function setupComputeEngine(
	fields: FieldDefinition[],
	formModel: Record<string, any>,
): WatchStopHandle[] {
	const graph = buildDependencyGraph(fields)
	const cycle = detectCycle(graph)
	if (cycle) throw new Error(`检测到循环依赖: ${cycle.join(' -> ')}`)

	const stops: WatchStopHandle[] = []

	fields.forEach((field) => {
		if (!field.compute) return

		const deps =
			field.compute.dependsOn?.length > 0
				? field.compute.dependsOn
				: extractDependencies(field.compute.expression)

		field.compute.dependsOn = deps

		const stop = watch(
			() => deps.map((d) => formModel[d]),
			() => {
				const ctx: RuntimeContext = buildRuntimeContext(deps, fields, formModel)

				const value = evaluateExpression(field.compute!.expression, ctx)

				formModel[field.fieldName] = applyUnit(
					value,
					field.compute!.unit,
					field.compute!.precision,
				)
			},
			{ immediate: true },
		)

		stops.push(stop)
	})

	return stops
}

export function buildRuntimeContext(
	fieldKeys: string[],
	fields: FieldDefinition[],
	values: Record<string, any>,
): RuntimeContext {
	const ctx: RuntimeContext = {}

	fieldKeys.forEach((key) => {
		const raw = values[key]
		const field = fields?.find(e => e.fieldName === key)
		switch (field?.valueType) {
			case 'number':
				ctx[key] = raw == null ? 0 : Number(raw)
				break
			case 'string':
				ctx[key] = raw ?? ''
				break
			case 'boolean':
				ctx[key] = Boolean(raw)
				break
			case 'date':
			case 'datetime':
			case 'time':
				ctx[key] = raw ? new Date(raw) : null
				break
		}
	})

	return ctx
}

export function applyUnit(
	value: any,
	unit?: TimeUnit,
	precision?: number,
) {
	if (typeof value !== 'number') {
		return value
	}

	let result = value

	if (unit) {
		const base = TIME_UNIT_MAP[unit]
		if (base) {
			result = value / base
		}
	}

	if (precision != null) {
		result = Number(result.toFixed(precision))
	}

	return result
}

export const TIME_UNIT_MAP: Record<TimeUnit, number> = {
	ms: 1,
	second: 1000,
	minute: 60 * 1000,
	hour: 60 * 60 * 1000,
	day: 24 * 60 * 60 * 1000,
}

export const timeUnitLabels: TimeUnitItem[] = [
	{
		label: '毫秒',
		value: 'ms'
	},
	{
		label: '秒数',
		value: 'second'
	},
	{
		label: '分钟',
		value: 'minute'
	},
	{
		label: '小时',
		value: 'hour'
	},
	{
		label: '天数',
		value: 'day'
	}
]

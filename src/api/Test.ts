import { http } from '../utils/request'

export const ipAddress = () =>
	http.get(
		'/api/ip/chaapi.php',
		{
			id: 10007994,
			key: 'a120d72461e56828f3626194e7a40de3',
		},
		{ rawResponse: true },
	)

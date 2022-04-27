# @pvm/plugin-http-proxy

Подключает библиотеку [global-agent](https://www.npmjs.com/package/global-agent) которая переопределяет
стандартные http(s) клиенты nodejs и добавляет в них поддержку прокси. 

Конфигурируется [переменными окружения](https://www.npmjs.com/package/global-agent#environment-variables). 
Namespace при инициализации мы указываем пустой, поэтому имена переменных не содержат префикса 
`${NAMESPACE}_` как в документации выше.
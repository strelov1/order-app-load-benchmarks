start:
	docker-compose up -d

load:
	k6 run load.js
# praktikum-chat-2022 

Schülerpraktikum 13.06.2022 bis 24.06.2022

## Setup server with docker

1. Locate the server folder in ssh. 
2. Run:
```
docker build --no-cache -t chat-server:latest .

docker-compose up -d
```

## Setup client with docker (Using nginx)

1. Locate the client folder in ssh. 
2. Run:
```
docker build --no-cache -t chat-client:latest .

docker-compose up -d
```
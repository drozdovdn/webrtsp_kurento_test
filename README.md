### Пример работы с WebRTSP Kurento
#### Запуск проекта
```bash 
npm run start
```

Для работы проекта требуется поднять в докере Kurento Media Server
```bash
docker pull kurento/kurento-media-server:latest

docker run -d --name kms --network host \
    kurento/kurento-media-server:latest
```
так же нужна `rtsp` ссылка на `ip` камеру


# Сайт-подарок для Шахи

Это статический сайт без сборщика и без внешних зависимостей. Его можно открыть напрямую:

```text
C:\Users\Asus\Downloads\project\project\index.html
```

Если нужен локальный сервер, можно запустить его из корня проекта через Python из runtime Codex:

```powershell
& 'C:\Users\Asus\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 4173
```

Оптимизированные изображения лежат в `photos-optimized/`. Исходники в `photos/` не изменяются.
Сайт использует все фото из папок `photos/together`, `photos/shaha`, `photos/childhood`, `photos/other`, а видео `photos/video/lip-sync.MP4` подключено отдельной карточкой без автозапуска.

Чтобы пересобрать изображения:

```powershell
& 'C:\Users\Asus\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\optimize-images.py
```

Скрипт создаёт AVIF и WebP версии в размерах `480w`, `768w`, `1080w`, `1440w`, а также обновляет `photos-optimized/manifest.json`. Сейчас собрано 39 изображений в 312 оптимизированных файлов.

#!/usr/bin/liquidsoap

set("server.telnet", true)
set("server.telnet.port", 1234)

playlist = playlist(id="playlist", mode="randomize", reload=60, "/var/www/radio/music")

radio = map_metadata(fun(m) ->
  let title = m["title"] in
  let artist = m["artist"] in
  let filename = m["filename"] in
  let base = list.hd(string.split(separator="/", filename), default=filename) in
  let t = if title != "" then title
          else string.replace(pattern="\\.mp3$|\\.flac$|\\.ogg$|\\.wav$", fun(_) -> "", base)
          end in
  let a = if artist != "" then artist else "" end in
  [("title", t), ("artist", a)],
  playlist
)

radio = mksafe(radio)

output.icecast(
  %mp3(bitrate=128),
  host="localhost",
  port=8000,
  password="kiruxA2212",
  mount="/fallback",
  name="ChillMatch Radio",
  description="ChillMatch vibes 24/7",
  icy_metadata="true",
  encoding="UTF-8",
  radio
)

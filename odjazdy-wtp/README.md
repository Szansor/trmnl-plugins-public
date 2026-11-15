<img src="docs/icon.png" width="96" align="right" alt="">

# Warsaw Transit Departures

A [TRMNL](https://trmnl.com) plugin that shows live departures from any public transport stop
in Warsaw, Poland (WTP buses and trams): the real departure time, the delay against the timetable,
the next departures and an optional small weather icon with the temperature.
The screen can be shown in **English** or **Polish**.

![Full screen on TRMNL OG](docs/full-og.png)

All layouts (TRMNL OG, TRMNL X landscape and portrait, half screens, quadrant): [docs/all-views.png](docs/all-views.png)

## Settings

| Field | What to enter |
|---|---|
| Stop (zbiorkom.live link) | Open [zbiorkom.live/warsaw](https://zbiorkom.live/warsaw), tap your stop (a specific pole, e.g. Centrum 01) and paste the page address, or just the stop ID, e.g. `centrum01-0fb5f` |
| Stop name on screen | e.g. `Centrum 01` |
| Only these lines | Optional, e.g. `175,520` |
| Screen language | English / Polski |
| Weather in the corner | Yes / No |
| Weather location | An address or coordinates, ideally near your stop |

By default the plugin shows the **Centrum 01** stop.

## Install

### Option 1: by hand in the TRMNL dashboard (no coding)

1. trmnl.com → **Plugins → Private Plugin → New**, give it a name, e.g. "Warsaw Transit".
2. **Strategy:** `Polling`, **Polling Verb:** `GET`.
3. **Polling URL(s):** paste both lines of `polling_url` from [`src/settings.yml`](src/settings.yml), each on its own line.
4. **Form Fields:** paste the whole list under `custom_fields:` from [`src/settings.yml`](src/settings.yml).
5. **Framework CSS version:** `v3.4.6`. **Refresh rate:** every 15 minutes.
6. **Save**, fill in the fields (stop and so on) and save again.
7. **Edit Markup** and paste each file into its tab:
   `full.liquid` → Full, `half_horizontal.liquid` → Half Horizontal, `half_vertical.liquid` → Half Vertical,
   `quadrant.liquid` → Quadrant, `shared.liquid` → Shared, `transform.js` → Transform (Serverless, Node).
8. Add the plugin to a playlist.

### Option 2: [trmnlp](https://github.com/usetrmnl/trmnlp)

```bash
git clone https://github.com/Szansor/trmnl-plugins-public
cd trmnl-plugins-public/odjazdy-wtp
trmnlp serve   # local preview at http://localhost:4567
trmnlp login   # then: trmnlp push
```

## How it works

- Every 15 minutes TRMNL fetches two addresses (*Polling* strategy):
  - `api.zbiorkom.live/api6-open/warsaw/stops/{ID}` — departures with delays,
  - `api.open-meteo.com` — the current weather.
- `transform.js` (Serverless, Node) picks the next 7 departures, works out the real time
  (timetable + delay) and turns the weather code into an icon.
- The layout uses TRMNL Framework 3.4.6 classes only, with no custom CSS. It covers all 4 layouts,
  TRMNL OG (1-bit and 2-bit), TRMNL X and portrait orientation.
- An e-paper screen does not refresh every minute, so the plugin shows clock times
  (not a countdown) and the time the data was fetched.
- If the screen says "Stop not found", copy the stop link again.

## Files

```
src/
  settings.yml           settings, data URLs and form fields
  shared.liquid          translations, icons, stop name, error screen
  full.liquid            full screen
  half_horizontal.liquid half screen, horizontal
  half_vertical.liquid   half screen, vertical
  quadrant.liquid        quadrant
  transform.js           data processing (Serverless, Node)
```

## Data sources

- Departures: [zbiorkom.live](https://zbiorkom.live) (open data from WTP / City of Warsaw)
- Weather: [Open-Meteo](https://open-meteo.com)

## Po polsku

Plugin pokazuje odjazdy na żywo z dowolnego przystanku w Warszawie. W ustawieniach wklejasz
link do przystanku z [zbiorkom.live/warsaw](https://zbiorkom.live/warsaw) i wybierasz
**Screen language → Polski**, żeby ekran był po polsku.

## License

[MIT](../LICENSE) — use, change and remix this plugin freely (including publishing your own
versions as TRMNL recipes). Just keep the author notice from the `LICENSE` file.

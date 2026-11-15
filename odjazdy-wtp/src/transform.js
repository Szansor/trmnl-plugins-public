function run(input) {
  var src = input || {};
  var parts = [];
  if (src.departures || src.current) parts.push(src);
  for (var k in src) {
    if (/^IDX_\d+$/.test(k) && src[k] && typeof src[k] === 'object') parts.push(src[k]);
  }

  var deps = null, wx = null, apiError = '';
  for (var p = 0; p < parts.length; p++) {
    var part = parts[p];
    if (Array.isArray(part.departures)) deps = part.departures;
    else if (part.current && part.current.weather_code !== undefined) wx = part.current;
    else if (part.error || part.code) apiError = String(part.error || part.code);
  }

  var cfv = (src.trmnl && src.trmnl.plugin_settings && src.trmnl.plugin_settings.custom_fields_values) || {};
  var pl = cfv.language === 'pl';
  var T_SCHED = pl ? 'wg rozkładu' : 'timetable';
  var T_ONTIME = pl ? 'o czasie' : 'on time';

  var now = Date.now();
  function lastSunday(year, month) {
    var d = new Date(Date.UTC(year, month + 1, 0, 1, 0, 0));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d.getTime();
  }
  function offsetMs(ms) {
    var y = new Date(ms).getUTCFullYear();
    return (ms >= lastSunday(y, 2) && ms < lastSunday(y, 9)) ? 7200000 : 3600000;
  }
  function hm(ms) {
    var d = new Date(ms + offsetMs(ms));
    var h = d.getUTCHours(), m = d.getUTCMinutes();
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  var list = [];
  var source = deps || [];
  for (var i = 0; i < source.length && list.length < 7; i++) {
    var d = source[i] || {};
    var trip = d.trip || {};
    var route = trip.route || {};
    var sched = Number(d.scheduledDeparture);
    if (!sched) continue;
    var delay = Number(d.delay) || 0;
    var real = sched + delay;
    if (real < now - 60000) continue;
    var dm = Math.floor(real / 60000) - Math.floor(sched / 60000);
    var live = d.isRealtime === true;
    var txt = !live ? T_SCHED : (dm === 0 ? T_ONTIME : (dm > 0 ? '+' + dm + ' min' : '−' + Math.abs(dm) + ' min'));
    list.push({
      line: String(route.name || route.id || '?'),
      headsign: String(trip.headsign || ''),
      sched: hm(sched),
      real: hm(real),
      delay_min: dm,
      delay_txt: txt,
      live: live,
      late: live && dm >= 3,
      cancelled: d.isCancelled === true
    });
  }

  var weather = null;
  if (wx) {
    var c = Number(wx.weather_code), day = wx.is_day !== 0;
    var icon = 'cloud';
    if (c === 0 || c === 1) { icon = day ? 'sun' : 'moon'; }
    else if (c === 2) { icon = day ? 'partly' : 'cloud'; }
    else if (c === 3) { icon = 'cloud'; }
    else if (c === 45 || c === 48) { icon = 'fog'; }
    else if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) { icon = 'rain'; }
    else if ((c >= 71 && c <= 77) || c === 85 || c === 86) { icon = 'snow'; }
    else if (c >= 95) { icon = 'storm'; }
    var t = Math.round(Number(wx.temperature_2m));
    weather = { temp: (t === 0 ? 0 : t), icon: icon };
  }

  var status = 'ok';
  if (deps === null) status = 'no_data';
  else if (list.length === 0) status = 'empty';

  return {
    ok: list.length > 0,
    status: status,
    api_error: apiError,
    fetched: hm(now),
    first: list.length ? list[0] : null,
    rest: list.slice(1),
    weather: weather
  };
}

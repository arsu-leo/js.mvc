const
url  = require('url'),
http = require('http');

module.exports = class HttpServer
{
  constructor(router)
  {
    this.router = router;
    this.server = http.createServer(this.dispatch);
  }

  listen(port)
  {
    this.server.listen(port);
  }

  dispatch(i, o)
  {
    const request =
    {
      headers : i.headers,
      method  : i.method,
      url     : url.parse(i.url, true),
      body    : ''
    };

    i.on('data', (data) => request.body += data);
    i.on('end', () =>
    {
      const
      route      = this.router.findRoute(request),
      View       = require(route.view),
      view       = new View(),
      Dispatcher = require(route.dispatcher),
      dispatcher = new Dispatcher(request, view);

      dispatcher.dispatch((vm) =>
      {
        o.writeHead(vm.status || 200, vm.headers);
        o.end(vm.body);
      });
    });
  }
}
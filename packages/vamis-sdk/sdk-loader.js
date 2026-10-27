/** Classic <script src="sdk.js"> bootstrap. Real runtime is sdk.esm.js + async chunks. */
;(function (root) {
  if (root.__VAMIS_SDK_LOADING) return
  root.__VAMIS_SDK_LOADING = true

  var pending = []
  var real = null

  function wrapScoped(method) {
    return function () {
      var args = arguments
      var self = this
      if (self.__real) return self.__real[method].apply(self.__real, args)
      if (method === 'doAction') {
        return new Promise(function (resolve, reject) {
          self.__calls.push(function (scoped) {
            Promise.resolve(scoped.doAction.apply(scoped, args)).then(resolve, reject)
          })
        })
      }
      self.__calls.push(function (scoped) {
        scoped[method].apply(scoped, args)
      })
    }
  }

  function makeScopedProxy() {
    return {
      __real: null,
      __calls: [],
      updateProps: wrapScoped('updateProps'),
      updateSchema: wrapScoped('updateSchema'),
      unmount: wrapScoped('unmount'),
      getComponentByName: wrapScoped('getComponentByName'),
      getComponents: wrapScoped('getComponents'),
      doAction: wrapScoped('doAction'),
      __bind: function (scoped) {
        this.__real = scoped
        var calls = this.__calls
        this.__calls = []
        for (var i = 0; i < calls.length; i++) calls[i](scoped)
      },
    }
  }

  function bind(name) {
    return function () {
      var args = arguments
      if (real) return real[name].apply(real, args)
      if (name === 'embed') {
        var proxy = makeScopedProxy()
        pending.push(function (api) {
          proxy.__bind(api.embed.apply(api, args))
        })
        return proxy
      }
      pending.push(function (api) {
        if (typeof api[name] === 'function') api[name].apply(api, args)
      })
    }
  }

  var stub = {
    embed: bind('embed'),
    registerRenderer: bind('registerRenderer'),
    parseSchemaText: bind('parseSchemaText'),
    yamlFromUnknown: bind('yamlFromUnknown'),
    jsonToIr: bind('jsonToIr'),
    parseToIr: bind('parseToIr'),
    registerSchemaIntellisense: bind('registerSchemaIntellisense'),
    registerSchemaTypeDoc: bind('registerSchemaTypeDoc'),
    registerSchemaPropertyDoc: bind('registerSchemaPropertyDoc'),
    registerSchemaTypeCatalog: bind('registerSchemaTypeCatalog'),
    mountFormEditor: bind('mountFormEditor'),
    normalizeEmbedSchema: bind('normalizeEmbedSchema'),
  }

  root.vamis = stub
  root.__VAMIS_SDK_READY = function (api) {
    real = api
    root.vamis = api
    root.__vamisSdkReady = true
    var jobs = pending
    pending = []
    for (var i = 0; i < jobs.length; i++) jobs[i](api)
    try {
      root.dispatchEvent(new Event('vamis-sdk-ready'))
    } catch (_err) {
      /* ignore */
    }
  }

  var src = document.currentScript && document.currentScript.src
  var esm = src ? new URL('./sdk.esm.js', src).href : './sdk.esm.js'
  var preload = document.createElement('link')
  preload.rel = 'modulepreload'
  preload.href = esm
  document.head.appendChild(preload)
  var el = document.createElement('script')
  el.type = 'module'
  el.src = esm
  document.head.appendChild(el)
})(typeof window !== 'undefined' ? window : this)

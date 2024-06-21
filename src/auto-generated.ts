
const runTimeDependencies = {
    "externals": {
        "@youwol/cdn-client": "^1.0.10",
        "@youwol/flux-view": "^1.0.3",
        "@youwol/fv-tabs": "^0.2.1",
        "@youwol/fv-tree": "^0.2.3",
        "@youwol/http-clients": "^2.0.5",
        "@youwol/os-top-banner": "^0.1.1",
        "rxjs": "^6.5.5"
    },
    "includedInBundle": {}
}
const externals = {
    "@youwol/cdn-client": "window['@youwol/cdn-client_APIv1']",
    "@youwol/flux-view": "window['@youwol/flux-view_APIv1']",
    "@youwol/fv-tabs": "window['@youwol/fv-tabs_APIv02']",
    "@youwol/fv-tree": "window['@youwol/fv-tree_APIv02']",
    "@youwol/http-clients": "window['@youwol/http-clients_APIv2']",
    "@youwol/os-top-banner": "window['@youwol/os-top-banner_APIv01']",
    "rxjs": "window['rxjs_APIv6']",
    "rxjs/operators": "window['rxjs_APIv6']['operators']"
}
const exportedSymbols = {
    "@youwol/cdn-client": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/cdn-client"
    },
    "@youwol/flux-view": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/flux-view"
    },
    "@youwol/fv-tabs": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/fv-tabs"
    },
    "@youwol/fv-tree": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/fv-tree"
    },
    "@youwol/http-clients": {
        "apiKey": "2",
        "exportedSymbol": "@youwol/http-clients"
    },
    "@youwol/os-top-banner": {
        "apiKey": "01",
        "exportedSymbol": "@youwol/os-top-banner"
    },
    "rxjs": {
        "apiKey": "6",
        "exportedSymbol": "rxjs"
    }
}

const mainEntry : {entryFile: string,loadDependencies:string[]} = {
    "entryFile": "./main.ts",
    "loadDependencies": [
        "@youwol/http-clients",
        "@youwol/cdn-client",
        "@youwol/flux-view",
        "rxjs",
        "@youwol/fv-tree",
        "@youwol/fv-tabs",
        "@youwol/os-top-banner"
    ]
}

const secondaryEntries : {[k:string]:{entryFile: string, name: string, loadDependencies:string[]}}= {}

const entries = {
     '@youwol/logs-explorer': './main.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/logs-explorer/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/logs-explorer',
        assetId:'QHlvdXdvbC9sb2dzLWV4cGxvcmVy',
    version:'0.1.0-wip',
    shortDescription:"Logs explorer during consistency testing with py-youwol",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/logs-explorer&tab=doc',
    npmPackage:'https://www.npmjs.com/package/@youwol/logs-explorer',
    sourceGithub:'https://github.com/youwol/logs-explorer',
    userGuide:'https://l.youwol.com/doc/@youwol/logs-explorer',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    secondaryEntries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/logs-explorer_APIv01`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{
        name: string,
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const entry = secondaryEntries[name]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/logs-explorer#0.1.0-wip~dist/@youwol/logs-explorer/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/logs-explorer/${entry.name}_APIv01`]
        })
    },
    getCdnDependencies(name?: string){
        if(name && !secondaryEntries[name]){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const deps = name ? secondaryEntries[name].loadDependencies : mainEntry.loadDependencies

        return deps.map( d => `${d}#${runTimeDependencies.externals[d]}`)
    }
}

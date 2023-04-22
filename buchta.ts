import { Elysia, Context } from "elysia";
import { cors } from '@elysiajs/cors'
import { Buchta } from "buchta/src/buchta";
import { CustomBundle } from "buchta/src/bundleToolGen";
import { BuchtaLogger } from "buchta/src/utils/logger";
import { normalize, relative } from "path";

export const buchta = (a: Elysia) => {
    a.use(cors());
    const buchta = new Buchta(true);
    buchta.attachToBundler((b: CustomBundle) => {
        const path = b.relativeImport(Bun.main);
        b.imports.push(`import { edenFetch } from '@elysiajs/eden'\n`);
        b.imports.push(`import type { App } from '${path}'\n`);
        b.content += `globalThis.eFetch = edenFetch<App>('http://localhost:${a.server?.port}');\n`;
        b.content += `globalThis.elysiaPort = ${a.server?.port}\n`;
    });

    buchta.builder.globalDeclarations.push({
        id: "const",
        name: "eFetch",
        type: "edenFetch<App>",
    })
    buchta.builder.globalDeclarations.push({
        id: "const",
        name: "elysiaPort",
        type: "number"
    })

    const path = relative(normalize(buchta.rootDir + "/.buchta/"), Bun.main);

    buchta.builder.imports.push(`import type { App } from "${path}"`)

    const fixRoute = (route: string) => {
        if (!route.endsWith("/")) {
            route += "/"
        }

        return route;
    }

    buchta.setup().then(buchta => {
        for (const route of buchta.pages) {
            if (typeof route.content == "string") {
                a.get(route.route, () => Bun.file(route.path ?? ""));

                if (!route.originalPath) continue;
                a.get(route.originalPath, () => Bun.file(route.path ?? ""));
            } else {
                a.get(fixRoute(route.route), (ctx: Context) => {
                    // @ts-ignore always
                    let path = decodeURI(ctx.request.url.match(/\d(?=\/).+/)[0].slice(1));
                    ctx.set.headers["Content-Type"] = "text/html";
                    return route.content(route.route, path);
                })
            }
        }

        const logger = BuchtaLogger(false);

        logger("Buchta is running on top of elysia!", "info");

    });
    return a;
}

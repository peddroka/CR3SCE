/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/payment-status/route";
exports.ids = ["app/api/payment-status/route"];
exports.modules = {

/***/ "(rsc)/./app/api/payment-status/route.ts":
/*!*****************************************!*\
  !*** ./app/api/payment-status/route.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabase_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabase/server */ \"(rsc)/./lib/supabase/server.ts\");\n\n\nasync function GET() {\n    try {\n        const supabase = await (0,_lib_supabase_server__WEBPACK_IMPORTED_MODULE_1__.createClient)();\n        const { data: { user }, error: authError } = await supabase.auth.getUser();\n        if (authError || !user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                authenticated: false,\n                status: \"anonymous\"\n            }, {\n                status: 200\n            });\n        }\n        const { data: profile, error: profileError } = await supabase.from(\"profiles\").select(\"payment_status\").eq(\"id\", user.id).maybeSingle();\n        if (profileError) {\n            console.error(\"Erro ao consultar payment_status:\", profileError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                authenticated: true,\n                status: \"unconfigured\"\n            }, {\n                status: 200\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            authenticated: true,\n            status: profile?.payment_status ?? \"pending\"\n        }, {\n            status: 200\n        });\n    } catch (error) {\n        console.error(\"Erro interno ao consultar payment_status:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            authenticated: true,\n            status: \"unconfigured\"\n        }, {\n            status: 200\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3BheW1lbnQtc3RhdHVzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEyQztBQUNVO0FBRTlDLGVBQWVFO0lBQ3BCLElBQUk7UUFDRixNQUFNQyxXQUFXLE1BQU1GLGtFQUFZQTtRQUNuQyxNQUFNLEVBQ0pHLE1BQU0sRUFBRUMsSUFBSSxFQUFFLEVBQ2RDLE9BQU9DLFNBQVMsRUFDakIsR0FBRyxNQUFNSixTQUFTSyxJQUFJLENBQUNDLE9BQU87UUFFL0IsSUFBSUYsYUFBYSxDQUFDRixNQUFNO1lBQ3RCLE9BQU9MLHFEQUFZQSxDQUFDVSxJQUFJLENBQ3RCO2dCQUFFQyxlQUFlO2dCQUFPQyxRQUFRO1lBQVksR0FDNUM7Z0JBQUVBLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE1BQU0sRUFBRVIsTUFBTVMsT0FBTyxFQUFFUCxPQUFPUSxZQUFZLEVBQUUsR0FBRyxNQUFNWCxTQUNsRFksSUFBSSxDQUFDLFlBQ0xDLE1BQU0sQ0FBQyxrQkFDUEMsRUFBRSxDQUFDLE1BQU1aLEtBQUthLEVBQUUsRUFDaEJDLFdBQVc7UUFFZCxJQUFJTCxjQUFjO1lBQ2hCTSxRQUFRZCxLQUFLLENBQUMscUNBQXFDUTtZQUNuRCxPQUFPZCxxREFBWUEsQ0FBQ1UsSUFBSSxDQUN0QjtnQkFBRUMsZUFBZTtnQkFBTUMsUUFBUTtZQUFlLEdBQzlDO2dCQUFFQSxRQUFRO1lBQUk7UUFFbEI7UUFFQSxPQUFPWixxREFBWUEsQ0FBQ1UsSUFBSSxDQUN0QjtZQUNFQyxlQUFlO1lBQ2ZDLFFBQVFDLFNBQVNRLGtCQUFrQjtRQUNyQyxHQUNBO1lBQUVULFFBQVE7UUFBSTtJQUVsQixFQUFFLE9BQU9OLE9BQU87UUFDZGMsUUFBUWQsS0FBSyxDQUFDLDZDQUE2Q0E7UUFDM0QsT0FBT04scURBQVlBLENBQUNVLElBQUksQ0FDdEI7WUFBRUMsZUFBZTtZQUFNQyxRQUFRO1FBQWUsR0FDOUM7WUFBRUEsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xccGVkZHJva2FcXE9uZURyaXZlXFxTaXN0ZW1hc1xcY3Jlc2NpLmFpXFxjcmVzY2ktYWlcXGFwcFxcYXBpXFxwYXltZW50LXN0YXR1c1xccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiQC9saWIvc3VwYWJhc2Uvc2VydmVyXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3VwYWJhc2UgPSBhd2FpdCBjcmVhdGVDbGllbnQoKTtcbiAgICBjb25zdCB7XG4gICAgICBkYXRhOiB7IHVzZXIgfSxcbiAgICAgIGVycm9yOiBhdXRoRXJyb3IsXG4gICAgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpO1xuXG4gICAgaWYgKGF1dGhFcnJvciB8fCAhdXNlcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGF1dGhlbnRpY2F0ZWQ6IGZhbHNlLCBzdGF0dXM6IFwiYW5vbnltb3VzXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDIwMCB9LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGRhdGE6IHByb2ZpbGUsIGVycm9yOiBwcm9maWxlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbShcInByb2ZpbGVzXCIpXG4gICAgICAuc2VsZWN0KFwicGF5bWVudF9zdGF0dXNcIilcbiAgICAgIC5lcShcImlkXCIsIHVzZXIuaWQpXG4gICAgICAubWF5YmVTaW5nbGUoKTtcblxuICAgIGlmIChwcm9maWxlRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvIGFvIGNvbnN1bHRhciBwYXltZW50X3N0YXR1czpcIiwgcHJvZmlsZUVycm9yKTtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBhdXRoZW50aWNhdGVkOiB0cnVlLCBzdGF0dXM6IFwidW5jb25maWd1cmVkXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDIwMCB9LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7XG4gICAgICAgIGF1dGhlbnRpY2F0ZWQ6IHRydWUsXG4gICAgICAgIHN0YXR1czogcHJvZmlsZT8ucGF5bWVudF9zdGF0dXMgPz8gXCJwZW5kaW5nXCIsXG4gICAgICB9LFxuICAgICAgeyBzdGF0dXM6IDIwMCB9LFxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm8gaW50ZXJubyBhbyBjb25zdWx0YXIgcGF5bWVudF9zdGF0dXM6XCIsIGVycm9yKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGF1dGhlbnRpY2F0ZWQ6IHRydWUsIHN0YXR1czogXCJ1bmNvbmZpZ3VyZWRcIiB9LFxuICAgICAgeyBzdGF0dXM6IDIwMCB9LFxuICAgICk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJjcmVhdGVDbGllbnQiLCJHRVQiLCJzdXBhYmFzZSIsImRhdGEiLCJ1c2VyIiwiZXJyb3IiLCJhdXRoRXJyb3IiLCJhdXRoIiwiZ2V0VXNlciIsImpzb24iLCJhdXRoZW50aWNhdGVkIiwic3RhdHVzIiwicHJvZmlsZSIsInByb2ZpbGVFcnJvciIsImZyb20iLCJzZWxlY3QiLCJlcSIsImlkIiwibWF5YmVTaW5nbGUiLCJjb25zb2xlIiwicGF5bWVudF9zdGF0dXMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/payment-status/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabase/server.ts":
/*!********************************!*\
  !*** ./lib/supabase/server.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createClient: () => (/* binding */ createClient)\n/* harmony export */ });\n/* harmony import */ var _supabase_ssr__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/ssr */ \"(rsc)/./node_modules/@supabase/ssr/dist/module/index.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\nasync function createClient() {\n    const cookieStore = await (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)();\n    return (0,_supabase_ssr__WEBPACK_IMPORTED_MODULE_0__.createServerClient)(\"https://wzxwbwharybtbkfhlnsg.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eHdid2hhcnlidGJrZmhsbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzc3NjUsImV4cCI6MjA4NzkxMzc2NX0.wTjpgvNvyKY_NpGFPRlrFQubZteQTW9JD7vRVGz10fQ\", {\n        cookies: {\n            getAll () {\n                return cookieStore.getAll();\n            },\n            setAll (cookiesToSet) {\n                try {\n                    cookiesToSet.forEach(({ name, value, options })=>{\n                        cookieStore.set(name, value, options);\n                    });\n                } catch (error) {\n                    // O middleware vai lidar com isso\n                    console.warn(\"Failed to set cookies in server component:\", error);\n                }\n            }\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Uvc2VydmVyLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFtRDtBQUNaO0FBR2hDLGVBQWVFO0lBQ3BCLE1BQU1DLGNBQWMsTUFBTUYscURBQU9BO0lBRWpDLE9BQU9ELGlFQUFrQkEsQ0FDdkJJLDBDQUFvQyxFQUNwQ0Esa05BQXlDLEVBQ3pDO1FBQ0VILFNBQVM7WUFDUE87Z0JBQ0UsT0FBT0wsWUFBWUssTUFBTTtZQUMzQjtZQUNBQyxRQUNFQyxZQUlHO2dCQUVILElBQUk7b0JBQ0ZBLGFBQWFDLE9BQU8sQ0FBQyxDQUFDLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFQyxPQUFPLEVBQUU7d0JBQzVDWCxZQUFZWSxHQUFHLENBQUNILE1BQU1DLE9BQU9DO29CQUMvQjtnQkFDRixFQUFFLE9BQU9FLE9BQU87b0JBQ2Qsa0NBQWtDO29CQUNsQ0MsUUFBUUMsSUFBSSxDQUFDLDhDQUE4Q0Y7Z0JBQzdEO1lBQ0Y7UUFDRjtJQUNGO0FBRUoiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xccGVkZHJva2FcXE9uZURyaXZlXFxTaXN0ZW1hc1xcY3Jlc2NpLmFpXFxjcmVzY2ktYWlcXGxpYlxcc3VwYWJhc2VcXHNlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVTZXJ2ZXJDbGllbnQgfSBmcm9tIFwiQHN1cGFiYXNlL3NzclwiO1xuaW1wb3J0IHsgY29va2llcyB9IGZyb20gXCJuZXh0L2hlYWRlcnNcIjtcbmltcG9ydCB0eXBlIHsgQ29va2llT3B0aW9ucyB9IGZyb20gXCJAc3VwYWJhc2Uvc3NyXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVDbGllbnQoKSB7XG4gIGNvbnN0IGNvb2tpZVN0b3JlID0gYXdhaXQgY29va2llcygpO1xuXG4gIHJldHVybiBjcmVhdGVTZXJ2ZXJDbGllbnQoXG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMISxcbiAgICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSEsXG4gICAge1xuICAgICAgY29va2llczoge1xuICAgICAgICBnZXRBbGwoKSB7XG4gICAgICAgICAgcmV0dXJuIGNvb2tpZVN0b3JlLmdldEFsbCgpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRBbGwoXG4gICAgICAgICAgY29va2llc1RvU2V0OiB7XG4gICAgICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgICAgICB2YWx1ZTogc3RyaW5nO1xuICAgICAgICAgICAgb3B0aW9ucz86IENvb2tpZU9wdGlvbnM7XG4gICAgICAgICAgfVtdLFxuICAgICAgICApIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29va2llc1RvU2V0LmZvckVhY2goKHsgbmFtZSwgdmFsdWUsIG9wdGlvbnMgfSkgPT4ge1xuICAgICAgICAgICAgICBjb29raWVTdG9yZS5zZXQobmFtZSwgdmFsdWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIE8gbWlkZGxld2FyZSB2YWkgbGlkYXIgY29tIGlzc29cbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBzZXQgY29va2llcyBpbiBzZXJ2ZXIgY29tcG9uZW50OlwiLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICApO1xufVxuIl0sIm5hbWVzIjpbImNyZWF0ZVNlcnZlckNsaWVudCIsImNvb2tpZXMiLCJjcmVhdGVDbGllbnQiLCJjb29raWVTdG9yZSIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsImdldEFsbCIsInNldEFsbCIsImNvb2tpZXNUb1NldCIsImZvckVhY2giLCJuYW1lIiwidmFsdWUiLCJvcHRpb25zIiwic2V0IiwiZXJyb3IiLCJjb25zb2xlIiwid2FybiJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase/server.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fpayment-status%2Froute&page=%2Fapi%2Fpayment-status%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpayment-status%2Froute.ts&appDir=C%3A%5CUsers%5Cpeddroka%5COneDrive%5CSistemas%5Ccresci.ai%5Ccresci-ai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cpeddroka%5COneDrive%5CSistemas%5Ccresci.ai%5Ccresci-ai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fpayment-status%2Froute&page=%2Fapi%2Fpayment-status%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpayment-status%2Froute.ts&appDir=C%3A%5CUsers%5Cpeddroka%5COneDrive%5CSistemas%5Ccresci.ai%5Ccresci-ai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cpeddroka%5COneDrive%5CSistemas%5Ccresci.ai%5Ccresci-ai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_peddroka_OneDrive_Sistemas_cresci_ai_cresci_ai_app_api_payment_status_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/payment-status/route.ts */ \"(rsc)/./app/api/payment-status/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/payment-status/route\",\n        pathname: \"/api/payment-status\",\n        filename: \"route\",\n        bundlePath: \"app/api/payment-status/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\peddroka\\\\OneDrive\\\\Sistemas\\\\cresci.ai\\\\cresci-ai\\\\app\\\\api\\\\payment-status\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_peddroka_OneDrive_Sistemas_cresci_ai_cresci_ai_app_api_payment_status_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZwYXltZW50LXN0YXR1cyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGcGF5bWVudC1zdGF0dXMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZwYXltZW50LXN0YXR1cyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNwZWRkcm9rYSU1Q09uZURyaXZlJTVDU2lzdGVtYXMlNUNjcmVzY2kuYWklNUNjcmVzY2ktYWklNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q3BlZGRyb2thJTVDT25lRHJpdmUlNUNTaXN0ZW1hcyU1Q2NyZXNjaS5haSU1Q2NyZXNjaS1haSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDaUQ7QUFDOUg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXHBlZGRyb2thXFxcXE9uZURyaXZlXFxcXFNpc3RlbWFzXFxcXGNyZXNjaS5haVxcXFxjcmVzY2ktYWlcXFxcYXBwXFxcXGFwaVxcXFxwYXltZW50LXN0YXR1c1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcGF5bWVudC1zdGF0dXMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9wYXltZW50LXN0YXR1c1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvcGF5bWVudC1zdGF0dXMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxwZWRkcm9rYVxcXFxPbmVEcml2ZVxcXFxTaXN0ZW1hc1xcXFxjcmVzY2kuYWlcXFxcY3Jlc2NpLWFpXFxcXGFwcFxcXFxhcGlcXFxccGF5bWVudC1zdGF0dXNcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fpayment-status%2Froute&page=%2Fapi%2Fpayment-status%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpayment-status%2Froute.ts&appDir=C%3A%5CUsers%5Cpeddroka%5COneDrive%5CSistemas%5Ccresci.ai%5Ccresci-ai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cpeddroka%5COneDrive%5CSistemas%5Ccresci.ai%5Ccresci-ai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@opentelemetry","vendor-chunks/@supabase","vendor-chunks/tslib","vendor-chunks/iceberg-js","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fpayment-status%2Froute&page=%2Fapi%2Fpayment-status%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpayment-status%2Froute.ts&appDir=C%3A%5CUsers%5Cpeddroka%5COneDrive%5CSistemas%5Ccresci.ai%5Ccresci-ai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cpeddroka%5COneDrive%5CSistemas%5Ccresci.ai%5Ccresci-ai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
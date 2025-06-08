module.exports = {

"[project]/.next-internal/server/app/api/sellable-products/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route.runtime.dev.js [external] (next/dist/compiled/next-server/app-route.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@opentelemetry/api [external] (@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@opentelemetry/api", () => require("@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}}),
"[project]/src/lib/sellable-products.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "createSellableProduct": (()=>createSellableProduct),
    "deleteSellableProduct": (()=>deleteSellableProduct),
    "getSellableProducts": (()=>getSellableProducts),
    "updateSellableProduct": (()=>updateSellableProduct)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
async function getSellableProducts() {
    try {
        const products = await prisma.sellableProduct.findMany({
            include: {
                components: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        return products;
    } catch (error) {
        console.error('Error fetching sellable products:', error);
        throw error;
    }
}
async function createSellableProduct(productData) {
    try {
        const product = await prisma.sellableProduct.create({
            data: {
                name: productData.name,
                description: productData.description || null,
                desiredProfitMargin: productData.desiredProfitMargin,
                totalComponentCost: productData.totalComponentCost,
                netSalePriceWithoutIVA: productData.netSalePriceWithoutIVA,
                ivaAmountOnSale: productData.ivaAmountOnSale,
                finalSalePriceWithIVA: productData.finalSalePriceWithIVA,
                components: {
                    create: productData.components.map((comp)=>({
                            itemName: comp.itemName,
                            quantity: comp.quantity,
                            purchasePriceAtTimeOfAssembly: comp.purchasePriceAtTimeOfAssembly,
                            inventoryItemId: comp.inventoryItemId || null
                        }))
                }
            },
            include: {
                components: true
            }
        });
        return product;
    } catch (error) {
        console.error('Error creating sellable product:', error);
        throw error;
    }
}
async function updateSellableProduct(id, productData) {
    try {
        // Primero actualizamos el producto
        const updatedProduct = await prisma.sellableProduct.update({
            where: {
                id
            },
            data: {
                name: productData.name,
                description: productData.description || null,
                desiredProfitMargin: productData.desiredProfitMargin,
                totalComponentCost: productData.totalComponentCost,
                netSalePriceWithoutIVA: productData.netSalePriceWithoutIVA,
                ivaAmountOnSale: productData.ivaAmountOnSale,
                finalSalePriceWithIVA: productData.finalSalePriceWithIVA
            },
            include: {
                components: true
            }
        });
        // Luego actualizamos los componentes
        if (productData.components) {
            // Eliminar componentes existentes
            await prisma.productComponent.deleteMany({
                where: {
                    productId: id
                }
            });
            // Crear nuevos componentes
            await prisma.productComponent.createMany({
                data: productData.components.map((comp)=>({
                        productId: id,
                        itemName: comp.itemName,
                        quantity: comp.quantity,
                        purchasePriceAtTimeOfAssembly: comp.purchasePriceAtTimeOfAssembly,
                        inventoryItemId: comp.inventoryItemId || null
                    }))
            });
            // Obtener el producto con los componentes actualizados
            const productWithComponents = await prisma.sellableProduct.findUnique({
                where: {
                    id
                },
                include: {
                    components: true
                }
            });
            return productWithComponents;
        }
        return updatedProduct;
    } catch (error) {
        console.error('Error updating sellable product:', error);
        throw error;
    }
}
async function deleteSellableProduct(id) {
    try {
        // Primero eliminamos los componentes asociados
        await prisma.productComponent.deleteMany({
            where: {
                productId: id
            }
        });
        // Luego eliminamos el producto
        await prisma.sellableProduct.delete({
            where: {
                id
            }
        });
    } catch (error) {
        console.error('Error deleting sellable product:', error);
        throw error;
    }
}
}}),
"[project]/src/app/api/sellable-products/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "DELETE": (()=>DELETE),
    "GET": (()=>GET),
    "POST": (()=>POST),
    "PUT": (()=>PUT)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sellable$2d$products$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sellable-products.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const products = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sellable$2d$products$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSellableProducts"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(products);
    } catch (error) {
        console.error('Error fetching sellable products:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Error al obtener los productos'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const productData = await request.json();
        const newProduct = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sellable$2d$products$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSellableProduct"])({
            ...productData,
            components: productData.components || []
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(newProduct, {
            status: 201
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Error al crear el producto'
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const { id, ...productData } = await request.json();
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Se requiere el ID del producto'
            }, {
                status: 400
            });
        }
        const updatedProduct = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sellable$2d$products$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateSellableProduct"])(id, productData);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Error al actualizar el producto'
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Se requiere el ID del producto'
            }, {
                status: 400
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sellable$2d$products$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteSellableProduct"])(id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Error al eliminar el producto'
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__0e04dc8e._.js.map
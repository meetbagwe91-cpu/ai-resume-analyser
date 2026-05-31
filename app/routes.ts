import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("auth", "routes/auth.tsx"),
    route("upload", "routes/upload.tsx"),
    route("build", "routes/build.tsx"),
    route("resume/:id", "routes/resume.tsx"),
    route("help", "routes/help.tsx"),
    route("privacy", "routes/privacy.tsx"),
    route("terms", "routes/terms.tsx"),
    route("refund", "routes/refund.tsx"),
    route("contact", "routes/contact.tsx"),
    route("wipe", "routes/wipe.tsx"),
    route("sitemap.xml", "routes/sitemap.xml.ts"),
    route("robots.txt", "routes/robots.txt.ts"),
    route("api/create-order", "routes/api.create-order.ts"),
    route("api/verify-payment", "routes/api.verify-payment.ts"),
    route("api/webhooks/razorpay", "routes/api.webhooks.razorpay.ts"),
] satisfies RouteConfig;

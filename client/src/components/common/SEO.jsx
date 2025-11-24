import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
    // Cấu hình mặc định (khi không truyền props)
    const defaultTitle = "TruyenVietHay - Đọc Truyện Tranh Online Hay Nhất";
    const defaultDesc = "Web đọc truyện tranh online cập nhật liên tục, giao diện mượt mà, không quảng cáo.";
    const defaultImage = "/logo.png";
    const siteUrl = window.location.origin; // Lấy URL gốc của trang web

    const metaTitle = title ? `${title} | TruyenVietHay` : defaultTitle;
    const metaDesc = description || defaultDesc;
    const metaImage = image || defaultImage;
    const metaUrl = url ? `${siteUrl}${url}` : siteUrl;

    return (
        <Helmet>
            {/* --- Standard Metadata --- */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDesc} />
            <link rel="canonical" href={metaUrl} />

            {/* --- Facebook Open Graph --- */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDesc} />
            <meta property="og:image" content={metaImage} />

            {/* --- Twitter Cards --- */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDesc} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
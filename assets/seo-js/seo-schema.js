document.write(`
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Datfuslab Technologies",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/assets/img/logo/logo-black02.png",
  "sameAs": [
    "https://facebook.com",
    "https://linkedin.com",
    "https://instagram.com"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Mydonation NGO CRM",
  "applicationCategory": "CRM Software",
  "operatingSystem": "Web Based",
  "description": "Mydonation is a cloud-based NGO CRM that helps NGOs manage donors, donations, receipts, reports, and campaigns with automation and ease.",
  "offers": {
    "@type": "Offer",
    "price": "15000",
    "priceCurrency": "INR"
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Mydonation CRM Plans",
  "description": "Starter, Professional, Premium, and Enterprise NGO CRM pricing plans.",
  "brand": {
    "@type": "Brand",
    "name": "Datfuslab Technologies"
  },
  "offers": [
    {"@type": "Offer", "name": "Starter Plan", "price": "15000", "priceCurrency": "INR"},
    {"@type": "Offer", "name": "Professional Plan", "price": "35000", "priceCurrency": "INR"},
    {"@type": "Offer", "name": "Premium Plan", "price": "50000", "priceCurrency": "INR"}
  ]
}
</script>
`);

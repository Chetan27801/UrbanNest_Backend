import puppeteer from "puppeteer";

export class PDFService {
	static async generateLeaseAgreementPDF(leaseData: any): Promise<Buffer> {
		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		try {
			const page = await browser.newPage();

			// Generate HTML content for the lease agreement
			const htmlContent = this.generateLeaseHTML(leaseData);

			await page.setContent(htmlContent, {
				waitUntil: "domcontentloaded",
			});

			const pdfBuffer = await page.pdf({
				format: "A4",
				printBackground: true,
				margin: {
					top: "20mm",
					right: "20mm",
					bottom: "20mm",
					left: "20mm",
				},
			});

			return Buffer.from(pdfBuffer);
		} finally {
			await browser.close();
		}
	}

	private static generateLeaseHTML(leaseData: any): string {
		console.log(leaseData);
		return `
        <!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8">
            <title>Lease Agreement</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
                .signature-box { width: 200px; border-bottom: 1px solid #000; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
            </head>
            <body>
            <div class="header">
                <h1>RESIDENTIAL LEASE AGREEMENT</h1>
                <p><strong>UrbanNest Property Management</strong></p>
            </div>

            <div class="section">
                <h3>PARTIES</h3>
                <p><strong>Landlord:</strong> ${
									leaseData.landlord.name
								} | <strong>Email:</strong> ${leaseData.landlord.email}</p>
                <p><strong>Tenant:</strong> ${
									leaseData.tenant.name
								} | <strong>Email:</strong> ${leaseData.tenant.email}</p>
            </div>

            <div class="section">
                <h3>PROPERTY DETAILS</h3>
                <p><strong>Address:</strong> ${
									leaseData.property.name
								} | <strong>Type:</strong> ${
			leaseData.property.propertyType
		}</p>
                <p><strong>Address:</strong> ${
									leaseData.property.location.address
								},${leaseData.property.location.city},${
			leaseData.property.location.state
		},${leaseData.property.location.country},${
			leaseData.property.location.postalCode
		}</p>
                
                <p><strong>Square Feet:</strong> ${
									leaseData.property.squareFeet
								}</p>
                <p><strong>Bedrooms:</strong> ${leaseData.property.beds}</p>
                <p><strong>Bathrooms:</strong> ${leaseData.property.baths}</p>
            </div>

            <div class="section">
                <h3>LEASE TERMS</h3>
                <table>
                <tr><th>Start Date</th><td>${new Date(
									leaseData.startDate
								).toLocaleDateString()}</td></tr>
                <tr><th>End Date</th><td>${new Date(
									leaseData.endDate
								).toLocaleDateString()}</td></tr>
                <tr><th>Monthly Rent</th><td>$${leaseData.rent.toLocaleString()}</td></tr>
                <tr><th>Security Deposit</th><td>$${leaseData.deposit.toLocaleString()}</td></tr>
                </table>
            </div>

            <div class="signature-section">
                <div>
                <div class="signature-box"></div>
                <p>Landlord Signature & Date</p>
                </div>
                <div>
                <div class="signature-box"></div>
                <p>Tenant Signature & Date</p>
                </div>
            </div>
            </body>
            </html>
    `;
	}
}

import PDFDocument from "pdfkit";

export class PDFService {
	static async generateLeaseAgreementPDF(leaseData: any): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({ margin: 50 });
			const buffers: Buffer[] = [];

			doc.on("data", buffers.push.bind(buffers));
			doc.on("end", () => {
				const pdfBuffer = Buffer.concat(buffers);
				resolve(pdfBuffer);
			});
			doc.on("error", reject);

			// Header
			doc.fontSize(20).text("RESIDENTIAL LEASE AGREEMENT", { align: "center" });
			doc
				.fontSize(14)
				.text("UrbanNest Property Management", { align: "center" });
			doc.moveDown(2);

			// Parties section
			doc.fontSize(16).text("PARTIES", { underline: true });
			doc
				.fontSize(12)
				.text(`Landlord: ${leaseData.landlord.name}`)
				.text(`Email: ${leaseData.landlord.email}`)
				.text(`Tenant: ${leaseData.tenant.name}`)
				.text(`Email: ${leaseData.tenant.email}`)
				.moveDown();

			// Property details
			doc.fontSize(16).text("PROPERTY DETAILS", { underline: true });
			doc
				.fontSize(12)
				.text(`Property: ${leaseData.property.name}`)
				.text(`Type: ${leaseData.property.propertyType}`)
				.text(`Address: ${leaseData.property.location.address}`)
				.text(
					`City: ${leaseData.property.location.city}, ${leaseData.property.location.state}`
				)
				.text(`Square Feet: ${leaseData.property.squareFeet}`)
				.text(
					`Bedrooms: ${leaseData.property.beds} | Bathrooms: ${leaseData.property.baths}`
				)
				.moveDown();

			// Lease terms
			doc.fontSize(16).text("LEASE TERMS", { underline: true });
			doc
				.fontSize(12)
				.text(
					`Start Date: ${new Date(leaseData.startDate).toLocaleDateString()}`
				)
				.text(`End Date: ${new Date(leaseData.endDate).toLocaleDateString()}`)
				.text(`Monthly Rent: $${leaseData.rent.toLocaleString()}`)
				.text(`Security Deposit: $${leaseData.deposit.toLocaleString()}`)
				.moveDown(4);

			// Signature section
			doc.fontSize(16).text("SIGNATURES", { underline: true });
			doc.moveDown(2);

			// Signature lines
			const leftMargin = doc.page.margins.left;
			const pageWidth =
				doc.page.width - doc.page.margins.left - doc.page.margins.right;
			const signatureWidth = (pageWidth - 40) / 2;

			doc
				.fontSize(10)
				.text("Landlord Signature", leftMargin, doc.y)
				.text("Tenant Signature", leftMargin + signatureWidth + 40, doc.y - 12);

			doc.moveDown();

			// Draw signature lines
			doc
				.moveTo(leftMargin, doc.y)
				.lineTo(leftMargin + signatureWidth, doc.y)
				.stroke();

			doc
				.moveTo(leftMargin + signatureWidth + 40, doc.y - 1)
				.lineTo(doc.page.width - doc.page.margins.right, doc.y - 1)
				.stroke();

			doc.moveDown();
			doc
				.fontSize(10)
				.text("Date: _______________", leftMargin, doc.y)
				.text(
					"Date: _______________",
					leftMargin + signatureWidth + 40,
					doc.y - 12
				);

			doc.end();
		});
	}
}

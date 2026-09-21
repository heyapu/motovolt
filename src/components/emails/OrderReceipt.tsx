import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Row,
    Section,
    Text,
    Column,
    Font,
} from "@react-email/components";
import * as React from "react";

interface OrderItem {
    title: string;
    quantity: number;
    price: number;
    variant_label?: string;
}

interface OrderReceiptProps {
    orderId: string;
    serialNumber: number;
    date: string;
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    address: string;
    items: OrderItem[];
}

export const OrderReceipt = ({
    orderId = "order_123",
    serialNumber = 1,
    date = new Date().toLocaleDateString(),
    amount = 0,
    customerName = "Customer",
    customerPhone = "N/A",
    customerEmail = "N/A",
    address = "N/A",
    items = [],
}: OrderReceiptProps) => {
    const formattedSerialNumber = `ORD-${String(serialNumber).padStart(4, "0")}`;

    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Chakra Petch"
                    fallbackFontFamily="sans-serif"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/chakrapetch/v11/cIf8MaZvlcrxW1NBVpGZziDjbnB_FWE.woff2",
                        format: "woff2",
                    }}
                    fontWeight={600}
                    fontStyle="normal"
                />
            </Head>
            <Preview>New Motovolt Order - {formattedSerialNumber}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Success Header */}
                    <Section style={successSection}>
                        <Text style={checkIcon}>✅</Text>
                        <Text style={successText}>Payment successful</Text>
                        <Text style={amountText}>₹{amount}</Text>
                    </Section>

                    {/* Invoice Header */}
                    <Section style={invoiceHeader}>
                        <Row>
                            <Column>
                                <Heading style={brandTitle}>Motovolt</Heading>
                                <Text style={subTitle}>Accessories invoice</Text>
                            </Column>
                            <Column align="right">
                                <Text style={metaText}>Order: {orderId}</Text>
                                <Text style={metaText}>Date: {date}</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* Billing & Delivery Info */}
                    <Section style={infoSection}>
                        <Text style={infoText}>
                            <strong>Billed to:</strong> {customerName}
                        </Text>
                        <Text style={infoText}>{customerPhone}</Text>
                        <Text style={infoText}>{customerEmail}</Text>
                        <Text style={infoText} className="mt-4">
                            <strong>Deliver to:</strong> {address}
                        </Text>
                    </Section>

                    {/* Items Table */}
                    <Section style={tableSection}>
                        <Row style={tableHeader}>
                            <Column style={{ width: "60%" }}>
                                <Text style={thText}>Item</Text>
                            </Column>
                            <Column style={{ width: "15%" }} align="center">
                                <Text style={thText}>Qty</Text>
                            </Column>
                            <Column style={{ width: "12.5%" }} align="right">
                                <Text style={thText}>Price</Text>
                            </Column>
                            <Column style={{ width: "12.5%" }} align="right">
                                <Text style={thText}>Total</Text>
                            </Column>
                        </Row>

                        {items.map((item, index) => (
                            <Row key={index} style={tableRow}>
                                <Column>
                                    <Text style={tdText}>
                                        {item.title} {item.variant_label ? `(${item.variant_label})` : ""}
                                    </Text>
                                </Column>
                                <Column align="center">
                                    <Text style={tdNumber}>{item.quantity}</Text>
                                </Column>
                                <Column align="right">
                                    <Text style={tdNumber}>₹{item.price}</Text>
                                </Column>
                                <Column align="right">
                                    <Text style={tdNumber}>₹{item.price * item.quantity}</Text>
                                </Column>
                            </Row>
                        ))}

                        <Row style={tableFooter}>
                            <Column colSpan={3}>
                                <Text style={thText}>Grand total (incl. taxes)</Text>
                            </Column>
                            <Column align="right">
                                <Text style={grandTotalText}>₹{amount}</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* Footer Note */}
                    <Section>
                        <Text style={footerNote}>
                            Payment received via Razorpay. Our team will call you within 24 hours to confirm delivery.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default OrderReceipt;

// --- Styles ---
// Inline styles are required for HTML emails to render correctly across all clients.

const main = {
    backgroundColor: "#ffffff",
    fontFamily: "'Roobert', Helvetica, Arial, sans-serif",
};

const container = {
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f3f4f6", // Light gray background from reference
    maxWidth: "600px",
};

const successSection = {
    textAlign: "center" as const,
    padding: "20px 0 40px",
    backgroundColor: "#ffffff",
    borderRadius: "8px 8px 0 0",
};

const checkIcon = {
    fontSize: "40px",
    margin: "0",
};

const successText = {
    fontSize: "16px",
    color: "#333",
    margin: "10px 0 0",
};

const amountText = {
    fontFamily: "'Chakra Petch', monospace",
    fontSize: "48px",
    fontWeight: "700",
    margin: "10px 0 0",
    color: "#111",
};

const invoiceHeader = {
    paddingTop: "20px",
};

const brandTitle = {
    fontSize: "24px",
    fontWeight: "600",
    margin: "0",
    color: "#111",
};

const subTitle = {
    fontSize: "14px",
    color: "#666",
    margin: "4px 0 0",
};

const metaText = {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 4px",
};

const infoSection = {
    padding: "20px 0",
};

const infoText = {
    fontSize: "14px",
    color: "#111",
    margin: "0 0 4px",
};

const tableSection = {
    width: "100%",
    marginTop: "20px",
};

const tableHeader = {
    borderBottom: "1px solid #d1d5db",
    paddingBottom: "8px",
};

const thText = {
    fontSize: "14px",
    fontWeight: "700",
    color: "#111",
    margin: "0",
};

const tableRow = {
    borderBottom: "1px solid #e5e7eb",
};

const tdText = {
    fontSize: "14px",
    color: "#111",
    padding: "12px 0",
    margin: "0",
};

const tdNumber = {
    fontFamily: "'Chakra Petch', monospace",
    fontSize: "14px",
    color: "#111",
    padding: "12px 0",
    margin: "0",
};

const tableFooter = {
    paddingTop: "12px",
};

const grandTotalText = {
    fontFamily: "'Chakra Petch', monospace",
    fontSize: "16px",
    fontWeight: "700",
    color: "#111",
    margin: "0",
};

const footerNote = {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "40px",
    borderTop: "1px solid #d1d5db",
    paddingTop: "20px",
};
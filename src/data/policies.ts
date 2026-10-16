/**
 * TruthCart AI - Grounded Retail Policy Documents
 * Official store policies with distinct clause IDs, precise rules, and explicit exception terms.
 */
import { StorePolicy } from '../types';

export const POLICIES: StorePolicy[] = [
  {
    id: 'pol-returns',
    category: 'returns',
    title: 'Return and Refund Policy',
    lastUpdated: '2026-09-01',
    clauses: [
      {
        id: 'POL-RET-01',
        clauseCode: 'RET-01',
        title: 'Standard Return Window for General Merchandise',
        category: 'returns',
        summary: '30-day return window for unopened general merchandise with original receipt.',
        content: 'Customers may return eligible unopened general merchandise within 30 calendar days of delivery for a 100% refund to the original method of payment. Items must be in brand-new, unblemished condition with all original packaging, UPC barcodes, accessories, and manuals intact. Proof of purchase (Order ID or physical receipt) is strictly required.',
        keywords: ['return window', '30 days', 'refund', 'unopened', 'receipt', 'packaging']
      },
      {
        id: 'POL-RET-02',
        clauseCode: 'RET-02',
        title: 'Electronics, Laptops, and Smartphone Return Window',
        category: 'returns',
        summary: '14-day return window for consumer electronics with a 10% restocking fee if opened.',
        content: 'Consumer electronics including laptops, smartphones, tablets, cameras, audio headphones, and smart home appliances must be returned within 14 calendar days of delivery. If the electronic item has been opened or unsealed, a mandatory 10% restocking fee will be deducted from the total refund amount to cover factory diagnostics and repacking. Opened items with missing accessories are subject to an additional 15% missing-parts deduction.',
        exceptions: [
          'Unopened factory-sealed electronics are exempt from the 10% restocking fee.',
          'Defective-on-arrival items reported within 48 hours receive full refund or exchange with zero restocking fee.'
        ],
        keywords: ['electronics', 'laptops', 'smartphones', 'headphones', '14 days', 'restocking fee', '10% fee']
      },
      {
        id: 'POL-RET-03',
        clauseCode: 'RET-03',
        title: 'Sanitary and In-Ear Hygiene Restrictions',
        category: 'returns',
        summary: 'In-ear earbuds and wearables exposed to skin are strictly non-returnable once opened.',
        content: 'For sanitary and hygiene reasons mandated by public health standards, in-ear audio devices (including AirPods Pro, wireless earbuds, and in-ear monitors) and intimate wearable fitness straps cannot be returned or refunded once the tamper-evident packaging seal has been broken or opened, unless verified defective by technical diagnostics upon receipt.',
        exceptions: ['Defective or non-functional units covered under manufacturer warranty.'],
        keywords: ['earbuds', 'in-ear', 'hygiene', 'airpods', 'non-returnable', 'health', 'unreturnable']
      },
      {
        id: 'POL-RET-04',
        clauseCode: 'RET-04',
        title: 'Holiday Extended Return Window',
        category: 'returns',
        summary: 'Purchases made between Nov 1 and Dec 24 can be returned through Jan 31.',
        content: 'Items purchased between November 1 and December 24 qualify for our extended holiday return privilege and may be returned until January 31 of the subsequent year. All standard restocking fee and hygiene condition requirements continue to apply.',
        keywords: ['holiday', 'extended return', 'christmas', 'november', 'january 31']
      },
      {
        id: 'POL-RET-05',
        clauseCode: 'RET-05',
        title: 'Return Shipping Costs and Prepaid Labels',
        category: 'returns',
        summary: 'Prepaid return shipping label costs $7.99 for remorse; free for defective/damaged items.',
        content: 'TruthCart provides a downloadable prepaid UPS return shipping label. For customer remorse, change of mind, or wrong size selection, a flat $7.99 shipping fee will be deducted from the refund. Return shipping is 100% free of charge if the return is caused by our shipping error, damaged in transit, or documented hardware defect.',
        keywords: ['return shipping', 'label', 'prepaid label', '7.99', 'free return shipping', 'defective']
      }
    ]
  },
  {
    id: 'pol-price-match',
    category: 'price_match',
    title: 'Price Match Guarantee Policy',
    lastUpdated: '2026-08-15',
    clauses: [
      {
        id: 'POL-PRC-01',
        clauseCode: 'PRC-01',
        title: 'Authorized Retailer Price Match Criteria',
        category: 'price_match',
        summary: 'Price match valid against authorized US retailers for identical in-stock items.',
        content: 'TruthCart will match the current advertised pre-tax price of any identical item (matching brand, model number, color, and SKU) offered by designated authorized competitors: Best Buy, B&H Photo, Target, Walmart (shipped and sold by Walmart directly), and Amazon (shipped and sold directly by Amazon.com). The item must be in-stock and immediately available for shipping at the competitor at the time of match request.',
        keywords: ['price match', 'competitor', 'best buy', 'amazon', 'identical model', 'sku', 'in-stock']
      },
      {
        id: 'POL-PRC-02',
        clauseCode: 'PRC-02',
        title: 'Exclusions from Price Match Guarantee',
        category: 'price_match',
        summary: 'Excludes third-party marketplace sellers, flash sales, clearance, and refurbished goods.',
        content: 'Price matching strictly excludes: third-party marketplace sellers (e.g. Amazon Marketplace, eBay, Walmart Marketplace), unverified flash sales, lightning deals, limited-quantity doorbusters, clearance or liquidation inventory, open-box items, refurbished products, typographic errors, and pricing requiring paid subscription memberships (e.g. Costco, Sam\'s Club).',
        exceptions: ['Authorized retailer direct store promotions on brand new inventory only.'],
        keywords: ['price match exclusions', 'marketplace', 'third-party', 'ebay', 'flash sale', 'open-box', 'refurbished']
      },
      {
        id: 'POL-PRC-03',
        clauseCode: 'PRC-03',
        title: 'Post-Purchase Price Adjustment Window',
        category: 'price_match',
        summary: '14-day post-purchase price adjustment if TruthCart price drops.',
        content: 'If an item purchased at TruthCart drops in price on our platform within 14 calendar days of your delivery date, contact customer support with your Order ID to receive a direct credit of the difference refunded back to your original payment method. One adjustment permitted per order.',
        keywords: ['price adjustment', 'price drop', '14 days', 'refund difference', 'credit']
      }
    ]
  },
  {
    id: 'pol-shipping',
    category: 'shipping',
    title: 'Shipping and Delivery Policy',
    lastUpdated: '2026-09-10',
    clauses: [
      {
        id: 'POL-SHP-01',
        clauseCode: 'SHP-01',
        title: 'Free Ground Shipping Threshold',
        category: 'shipping',
        summary: 'Free standard ground shipping on qualifying orders totaling $50.00 or more.',
        content: 'Orders with a subtotal of $50.00 or higher (excluding sales tax and promotional discounts) qualify for Free Standard Ground Shipping within the contiguous 48 United States. Standard ground transit takes 3 to 5 business days from our fulfillment centers.',
        keywords: ['free shipping', 'shipping threshold', '50 dollars', 'ground shipping', '3 to 5 days']
      },
      {
        id: 'POL-SHP-02',
        clauseCode: 'SHP-02',
        title: 'Expedited and Priority Overnight Shipping Options',
        category: 'shipping',
        summary: 'Express 2-Day ($14.99) and Overnight ($29.99) with 2:00 PM EST daily cutoff.',
        content: 'Customers may select Express 2-Day Air ($14.99 flat rate) or Priority Overnight ($29.99 flat rate). To guarantee same-day warehouse dispatch, expedited orders must be placed prior to 2:00 PM Eastern Standard Time (EST) on regular business days (Monday through Friday). Orders placed after 2:00 PM EST ship the following business day. TruthCart does not offer Sunday carrier deliveries.',
        exceptions: ['Hazardous materials and lithium-ion batteries over 100Wh cannot ship via air express.'],
        keywords: ['express shipping', 'overnight', '2-day', 'cutoff', '2 pm est', 'fedex', 'sunday delivery']
      },
      {
        id: 'POL-SHP-03',
        clauseCode: 'SHP-03',
        title: 'Out of Stock and Backorder Policy',
        category: 'shipping',
        summary: 'Out of stock items cannot be purchased or promised for expedited delivery.',
        content: 'Products marked as "Out of Stock" cannot be purchased for immediate or guaranteed expedited delivery under any circumstance. Customers may enroll in backorder notifications. TruthCart staff and automated representatives are strictly forbidden from promising arbitrary delivery dates on unstocked items.',
        keywords: ['out of stock', 'backorder', 'delivery promise', 'unavailable', 'lead time']
      },
      {
        id: 'POL-SHP-04',
        clauseCode: 'SHP-04',
        title: 'Damaged in Transit and Lost Package Claims',
        category: 'shipping',
        summary: 'Transit damage must be reported within 48 hours with packaging photos.',
        content: 'If an item arrives visibly damaged or tampered with, customers must notify TruthCart within 48 hours of carrier delivery confirmation with photographic proof of the external shipping box and internal product damage. Claims filed after 48 hours are handled through carrier insurance investigation.',
        keywords: ['damaged in transit', 'lost package', '48 hours', 'carrier claim', 'photographs']
      }
    ]
  },
  {
    id: 'pol-warranty',
    category: 'warranty',
    title: 'Warranty and Coverage Policy',
    lastUpdated: '2026-08-01',
    clauses: [
      {
        id: 'POL-WAR-01',
        clauseCode: 'WAR-01',
        title: 'Manufacturer Limited Warranty Protection',
        category: 'warranty',
        summary: 'All new electronics carry minimum 12-month manufacturer limited hardware warranty.',
        content: 'All brand-new electronic merchandise sold on TruthCart includes the full manufacturer limited warranty, spanning a minimum of 12 months (or up to 36 months for enterprise items like ThinkPads, and 12 years for Herman Miller chairs). This warranty covers mechanical and electrical defects arising under normal personal usage.',
        keywords: ['warranty', 'manufacturer warranty', '12 months', 'hardware defects', 'coverage']
      },
      {
        id: 'POL-WAR-02',
        clauseCode: 'WAR-02',
        title: 'Warranty Exclusions: Accidental Damage and Liquid Intrusion',
        category: 'warranty',
        summary: 'Standard warranty excludes drops, water submersion beyond IP rating, and unauthorized repairs.',
        content: 'Standard manufacturer warranties do NOT cover: physical impact damage from drops, cracked screens, electrical power surges, unauthorized aftermarket modification or jailbreaking, or liquid immersion damage beyond certified lab IP rating limits. Water damage on water-resistant devices (such as IP68 smartphones) is NOT covered if ingress occurred beyond specified depth/time limits or due to cracked casing.',
        keywords: ['warranty exclusions', 'accidental damage', 'water damage', 'cracked screen', 'liquid ingress']
      }
    ]
  },
  {
    id: 'pol-security',
    category: 'general',
    title: 'Compliance, Tax, and Integrity Policy',
    lastUpdated: '2026-09-01',
    clauses: [
      {
        id: 'POL-SEC-01',
        clauseCode: 'SEC-01',
        title: 'Sales Tax Compliance and Invoice Integrity',
        category: 'general',
        summary: 'Sales tax is calculated legally based on destination; invoice falsification is illegal.',
        content: 'TruthCart collects statutory state and municipal sales taxes in full compliance with United States destination-based marketplace legislation. Our staff and AI systems cannot bypass sales taxes, forge lower customs valuation invoices, alter invoice billing names, or facilitate illicit tax avoidance.',
        keywords: ['sales tax', 'tax exemption', 'invoice', 'customs', 'compliance', 'legal']
      }
    ]
  }
];

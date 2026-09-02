/**
 * The app's user agreement, copied verbatim from the mobile app's
 * constants/legalAgreement.ts. Duplicated on purpose: the website shares no
 * files with the monorepo, so this is the site's own copy. Keep both in step
 * whenever the agreement changes.
 */
export const LEGAL_AGREEMENT_VERSION = "1.0";
export const LEGAL_AGREEMENT_EFFECTIVE_DATE = "June 2026";
export const LEGAL_ACCEPTED_STORAGE_KEY = "pricedug_legal_accepted_version";

export interface LegalSection {
  heading: string;
  body: string;
}

export const LEGAL_AGREEMENT_TITLE = "User Agreement, Liability Waiver & Dispute Resolution";

export const LEGAL_AGREEMENT_INTRO =
  `Effective ${LEGAL_AGREEMENT_EFFECTIVE_DATE} · Version ${LEGAL_AGREEMENT_VERSION}\n\n` +
  `Please read this Agreement carefully. By ticking the box and continuing, you confirm that you ` +
  `have read, understood, and agree to be legally bound by every part of it, including the ` +
  `Liability Waiver, the Binding Arbitration clause, and the Class Action Waiver. If you do not ` +
  `agree, do not use the Priced Ug application ("the App").`;

export const LEGAL_AGREEMENT_SECTIONS: LegalSection[] = [
  {
    heading: "1. Acceptance & Consent",
    body:
      "By downloading, accessing, or using the App, you (\"User\", \"you\") enter into a binding legal " +
      "agreement with the owner and operator of the App (\"Owner\", \"we\", \"us\"). You consent to the " +
      "collection and use of your information as described in our Privacy Policy, and you agree to these " +
      "terms on behalf of yourself and, where applicable, any business or person you represent. You confirm " +
      "you are at least 18 years old and legally able to enter into this Agreement.",
  },
  {
    heading: "2. Nature of the Service",
    body:
      "The App is a directory and marketplace platform that lets businesses list products and lets the public " +
      "browse and contact those businesses. The Owner is NOT a party to any transaction, sale, or " +
      "communication between users and businesses. The Owner does not manufacture, sell, inspect, or " +
      "guarantee any product, price, or service listed. Any dealing you have with a business is solely between " +
      "you and that business, at your own risk.",
  },
  {
    heading: "3. Assumption of Risk",
    body:
      "You understand and voluntarily accept all risks arising from your use of the App and from any interaction, " +
      "purchase, payment, or meeting involving a business or other user. This includes, without " +
      "limitation, the risk of inaccurate listings, defective or unsafe products, fraud, financial " +
      "loss, personal injury, or property damage. You use the App and deal with businesses entirely at your own risk.",
  },
  {
    heading: "4. Release & Liability Waiver",
    body:
      "To the fullest extent permitted by law, you hereby RELEASE, WAIVE, and forever discharge the Owner and its " +
      "operators, employees, and agents from any and all claims, demands, damages, losses, liabilities, costs, and " +
      "expenses of every kind — whether known or unknown, direct or indirect — arising out of or connected with your " +
      "use of the App or any dealing with a business or user through the App. You agree not to hold the Owner " +
      "responsible for the acts, omissions, products, or conduct of any business or user.",
  },
  {
    heading: "5. Disclaimer of Warranties",
    body:
      "The App is provided \"AS IS\" and \"AS AVAILABLE\" without warranties of any kind, express or implied, " +
      "including any warranty of merchantability, fitness for a particular purpose, accuracy, or non-infringement. " +
      "We do not warrant that the App will be uninterrupted, error-free, secure, or that any listing is accurate, " +
      "current, or lawful.",
  },
  {
    heading: "6. Limitation of Liability",
    body:
      "To the maximum extent permitted by law, the Owner's total liability to you for any and all claims relating to " +
      "the App shall not exceed the greater of the amount you paid to the Owner (if any) in the 12 months before the " +
      "claim, or UGX 100,000. In no event shall the Owner be liable for any indirect, incidental, special, " +
      "consequential, punitive, or exemplary damages, or for lost profits, data, or goodwill.",
  },
  {
    heading: "7. Indemnification",
    body:
      "You agree to defend, indemnify, and hold harmless the Owner from any claim, liability, loss, or expense " +
      "(including reasonable legal fees) arising from your use of the App, your violation of this Agreement, or your " +
      "dealings with any business or user.",
  },
  {
    heading: "8. Binding Individual Arbitration",
    body:
      "You and the Owner agree that any dispute, claim, or controversy arising out of or relating to this Agreement " +
      "or the App shall be resolved exclusively by final and binding arbitration on an INDIVIDUAL basis, and NOT in a " +
      "court of law, except that either party may bring a qualifying claim in a small-claims forum. The arbitration " +
      "shall be conducted in Uganda, in English, under applicable arbitration rules. You understand that by agreeing " +
      "to arbitration, you are giving up your right to go to court and your right to a trial by judge or jury.",
  },
  {
    heading: "9. Class Action & Jury Trial Waiver",
    body:
      "To the fullest extent permitted by law, you and the Owner agree that each may bring claims against the other " +
      "ONLY in an individual capacity, and NOT as a plaintiff or class member in any purported class, collective, " +
      "consolidated, or representative action. You expressly WAIVE any right to participate in a class action or " +
      "class-wide arbitration and WAIVE any right to a trial by jury. No arbitrator or court may consolidate more " +
      "than one person's claims or preside over any form of representative or class proceeding.",
  },
  {
    heading: "10. Governing Law & Venue",
    body:
      "This Agreement is governed by the laws of the Republic of Uganda, without regard to conflict-of-law rules. " +
      "Subject to the arbitration clause above, the courts and tribunals of Uganda shall have jurisdiction over any " +
      "matter not subject to arbitration.",
  },
  {
    heading: "11. Severability & Entire Agreement",
    body:
      "If any provision of this Agreement is found unenforceable, that provision shall be limited or removed to the " +
      "minimum extent necessary, and the remaining provisions shall stay in full force. If the Class Action Waiver is " +
      "found unenforceable for a particular claim, that claim shall proceed in court, but all other claims remain in " +
      "arbitration. This Agreement, together with the Privacy Policy, is the entire agreement between you and the Owner.",
  },
  {
    heading: "12. Changes & Contact",
    body:
      "We may update this Agreement from time to time. Continued use of the App after an update, or accepting a new " +
      "version when prompted, means you accept the changes. For questions about this Agreement, contact the Owner " +
      "through the support options in the App.",
  },
];

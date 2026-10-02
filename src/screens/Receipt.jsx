import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Printer, RotateCcw, X } from "lucide-react";
import { L, LANG, nm, usd, khr, qtyText, dateTimeText } from "../i18n";

const lineName = (i) => (LANG === "en" ? i.name_en || i.name_kh : i.name_kh || i.name_en);

// 80 mm receipt. The paper copy is drawn into #print-root and printed with the browser (window.print).
export function ReceiptPaper({ sale: s, catalog }) {
  const st = catalog?.setting || {};
  const wh = catalog?.warehouse || {};
  const company = (LANG === "en" ? st.company_name_en || st.company_name_kh : st.company_name_kh || st.company_name_en) || nm(wh);
  return (
    <div className="rc">
      <div className="rc-head">
        {st.logo && <img src={st.logo} alt="" />}
        <b>{company}</b>
        {company !== nm(wh) && <span>{nm(wh)}</span>}
        {(wh.address || st.address) && <span>{wh.address || st.address}</span>}
        {(wh.phone || st.phone) && <span>{L("ទូរស័ព្ទ", "Tel")}: {wh.phone || st.phone}</span>}
        {st.vat_no && <span>VAT: {st.vat_no}</span>}
        {st.receipt_header && <span className="rc-note">{st.receipt_header}</span>}
      </div>
      <div className="rc-meta">
        <span>{L("វិក្កយបត្រ", "Invoice")}: <b>{s.invoice_no}</b></span>
        <span>{dateTimeText(s.sold_at)}</span>
        <span>{L("អ្នកគិតលុយ", "Cashier")}: {s.cashier_name}</span>
      </div>
      <table className="rc-items">
        <tbody>
          {s.items.map((i, k) => (
            <React.Fragment key={k}>
              <tr><td colSpan={2} className="rc-name">{lineName(i)}</td></tr>
              <tr>
                <td>{qtyText(i.qty)} {LANG === "en" ? i.unit_name_en || i.unit_code : i.unit_name_kh || i.unit_code} × {usd(i.price)}</td>
                <td className="rc-r">{usd(i.qty * i.price)}</td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="rc-sum">
        <div><span>{L("សរុបរង", "Subtotal")}</span><span>{usd(s.subtotal)}</span></div>
        {s.discount_total > 0 && <div><span>{L("បញ្ចុះតម្លៃ", "Discount")}{s.discount_type === "percent" ? ` ${s.discount_value}%` : ""}</span><span>−{usd(s.discount_total)}</span></div>}
        {s.tax_mode !== "none" && s.tax_amount > 0 && <div><span>{s.tax_name} {s.tax_rate}%{s.tax_mode === "inclusive" ? ` (${L("រួម", "incl.")})` : ""}</span><span>{usd(s.tax_amount)}</span></div>}
        <div className="rc-total"><span>{L("សរុប", "TOTAL")}</span><span>{usd(s.total)}</span></div>
        <div className="rc-khr"><span>{L("ជារៀល", "In riel")}</span><span>{khr(s.total_khr)}</span></div>
      </div>
      <div className="rc-pay">
        {s.payments.map((p, k) => (
          <div key={k}><span>{LANG === "en" ? p.name_en : p.name_kh}{p.reference ? ` (${p.reference})` : ""}</span><span>{p.currency === "KHR" ? khr(p.amount) : usd(p.amount)}</span></div>
        ))}
        {s.change_usd > 0 && (
          <div><span>{L("ប្រាក់អាប់", "Change")}</span><span>{[s.change_give_usd ? usd(s.change_give_usd) : "", s.change_give_khr ? khr(s.change_give_khr) : ""].filter(Boolean).join(" + ") || usd(s.change_usd)}</span></div>
        )}
      </div>
      <div className="rc-foot">
        <span>1$ = {khr(s.rate)}</span>
        {st.receipt_footer && <b>{st.receipt_footer}</b>}
      </div>
    </div>
  );
}

export function printReceipt(node) {
  const root = document.getElementById("print-root");
  if (!root) return;
  root.innerHTML = "";
  root.appendChild(node.cloneNode(true));
  setTimeout(() => window.print(), 50);
}

// After a sale (and for reprints): the receipt on screen + Print
export default function Receipt({ sale, catalog, onClose, autoPrint, onRefund }) {
  const ref = React.useRef(null);
  useEffect(() => {
    if (!autoPrint) return undefined;
    const t = setTimeout(() => ref.current && printReceipt(ref.current), 150);
    return () => clearTimeout(t);
  }, [autoPrint]);
  useEffect(() => {
    const h = (e) => (e.key === "Enter" || e.key === "Escape") && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return createPortal(
    <div className="pos-back" onMouseDown={onClose}>
      <div className="pos-dialog pos-rcdlg" onMouseDown={(e) => e.stopPropagation()}>
        <div className="pos-dialog-head">
          <h3>{autoPrint ? <><CheckCircle2 size={20} className="pos-ok" /> {L("បានលក់", "Sale complete")}</> : sale.invoice_no}</h3>
          <button type="button" className="pos-icon" onClick={onClose}><X size={20} /></button>
        </div>
        {autoPrint && sale.change_usd > 0 && (
          <div className="pos-change-big">
            {L("អាប់", "Give change")}: <b>{[sale.change_give_usd ? usd(sale.change_give_usd) : "", sale.change_give_khr ? khr(sale.change_give_khr) : ""].filter(Boolean).join(" + ")}</b>
          </div>
        )}
        {sale.refunded_total > 0 && (
          <div className="pos-rf-note"><RotateCcw size={15} /> {sale.refund_status === "full" ? L("បានសងទាំងអស់", "Fully refunded") : L("បានសងខ្លះ", "Partly refunded")} · −{usd(sale.refunded_total)}</div>
        )}
        <div className="pos-rc-preview" ref={ref}>
          <ReceiptPaper sale={sale} catalog={catalog} />
        </div>
        <div className="pos-dialog-foot">
          <button type="button" className="pos-btn pos-btn-ghost" onClick={() => printReceipt(ref.current)}><Printer size={18} /> {L("បោះពុម្ព", "Print")}</button>
          {onRefund && sale.state === "paid" && sale.refund_status !== "full" && (
            <button type="button" className="pos-btn pos-btn-ghost pos-btn-warn" onClick={onRefund}><RotateCcw size={18} /> {sale.refunded_total ? L("សងបន្ថែម", "Refund more") : L("សង / លុបចោល", "Refund / void")}</button>
          )}
          <button type="button" className="pos-btn pos-btn-primary pos-btn-lg" onClick={onClose} autoFocus>{autoPrint ? L("លក់បន្ទាប់ (Enter)", "Next sale (Enter)") : L("បិទ", "Close")}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ReportNotice({ failed }: { failed: boolean }) {
  if (!failed) return null;
  return (
    <div role="alert" className="report-notice">
      {/* Some analytics could not be loaded. Reload the page to try again. Empty
      values may be incomplete. */}
    </div>
  );
}

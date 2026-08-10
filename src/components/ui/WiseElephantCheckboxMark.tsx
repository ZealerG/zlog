import { WISE_ELEPHANT_CHECK_PATH } from "@/lib/ui/wise-elephant"

export function WiseElephantCheckboxMark() {
  return (
    <span className="wise-checkbox-box" aria-hidden>
      <span className="wise-checkbox-fill" />
      <span className="wise-checkbox-checkmark">
        <svg
          className="wise-checkbox-icon"
          viewBox="0 0 24 24"
          focusable="false"
        >
          <path d={WISE_ELEPHANT_CHECK_PATH} />
        </svg>
      </span>
      <span className="wise-checkbox-ripple" />
    </span>
  )
}

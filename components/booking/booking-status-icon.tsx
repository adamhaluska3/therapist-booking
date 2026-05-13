import { CheckCheck, CheckCircle, Clock, XCircle } from "lucide-react"

export const bookingStatusIcon = {
  pending:   <Clock className="text-yellow-500" />,
  confirmed: <CheckCircle className="text-green-500" />,
  cancelled: <XCircle className="text-red-500" />,
  finished:  <CheckCheck className="text-neutral-400" />,
}
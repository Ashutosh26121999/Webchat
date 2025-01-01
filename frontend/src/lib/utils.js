import moment from "moment";

export function formatTimestamp(timestamp) {
  return moment().diff(timestamp, "days") >= 10
    ? moment(timestamp).format("MMM DD YYYY hh:mm A")
    : moment(timestamp).fromNow();
}

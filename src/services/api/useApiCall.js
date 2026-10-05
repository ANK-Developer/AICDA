import { useCallback } from "react";

// RTK Query hooks re-render their component whenever request state changes. These
// wrappers expose plain promise-returning functions instead — the same shape the
// old fetch helpers had — so event handlers and effects can `await` them and keep
// their own loading/error state. Both resolve with the endpoint's data and reject
// with `{ status, data, message }`.
const IGNORE_STATE = { selectFromResult: () => ({}) };

// For endpoints declared with builder.query: answers from the cache when the same
// request was already made, and only hits the network otherwise. Mutations
// invalidate the related tags, so a changed collection is refetched next time.
export function useLazyCall(useLazyQueryHook) {
  const [trigger] = useLazyQueryHook(IGNORE_STATE);
  return useCallback((arg) => trigger(arg, true).unwrap(), [trigger]);
}

// For endpoints declared with builder.mutation.
export function useMutate(useMutationHook) {
  const [mutate] = useMutationHook(IGNORE_STATE);
  return useCallback((arg) => mutate(arg).unwrap(), [mutate]);
}

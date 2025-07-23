export const ResetTokenStatusArray = ['isValid','used', 'expired', 'invalidated'] as const;

export const RESET_TOKEN_STATUS = {
    IS_VALID : ResetTokenStatusArray[0],
    USED: ResetTokenStatusArray[1],
    EXPIRED: ResetTokenStatusArray[2],
    INVALIDATED: ResetTokenStatusArray[3]
}
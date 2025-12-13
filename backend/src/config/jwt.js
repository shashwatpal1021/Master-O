// Support both ACCESS_TOKEN and ACCESS_token environment variable names for compatibility
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN
// READ: REFRESH_TOKEN_SECRET or fallback to legacy names or ACCESS_TOKEN
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN

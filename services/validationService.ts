// This service simulates an API call to a master HSN database.
// In a real-world application, this would be a network request to a government or third-party API.

// A mock database of HSN codes and their corresponding official GST rates.
const hsnMasterData: Record<string, number> = {
    '8471': 18,
    '8473': 28,
    '8528': 28,
    '8479': 18,
    '8461': 18,
    '847130': 18,
    '847160': 18,
    '847170': 18,
    '847330': 28,
    '852380': 18,
    '852852': 28,
    '9983': 18, // IT Services
};

export type HsnValidationStatus = 'valid' | 'invalid' | 'mismatch';

export interface HsnValidationResult {
    status: HsnValidationStatus;
    message: string;
    correctRate?: number;
}

/**
 * Validates an HSN code and its GST rate against a master database.
 * @param hsn - The HSN code to validate.
 * @param rate - The GST rate provided by the user.
 * @returns A promise that resolves to a validation result object.
 */
export const validateHsnCode = (hsn: string, rate: number): Promise<HsnValidationResult> => {
    // Simulate network latency for a realistic user experience
    return new Promise(resolve => {
        setTimeout(() => {
            const trimmedHsn = hsn.trim();
            if (hsnMasterData.hasOwnProperty(trimmedHsn)) {
                const correctRate = hsnMasterData[trimmedHsn];
                if (correctRate === rate) {
                    resolve({
                        status: 'valid',
                        message: `HSN is valid. Correct GST Rate: ${correctRate}%`,
                        correctRate: correctRate,
                    });
                } else {
                    resolve({
                        status: 'mismatch',
                        message: `Rate Mismatch! Official rate for ${trimmedHsn} is ${correctRate}%.`,
                        correctRate: correctRate,
                    });
                }
            } else {
                resolve({
                    status: 'invalid',
                    message: `HSN code ${trimmedHsn} not found or is invalid.`,
                });
            }
        }, 500); // 500ms delay
    });
};

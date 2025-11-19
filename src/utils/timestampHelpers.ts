/**
 * Normalizza un timestamp da Firestore in millisecondi (numero).
 * Gestisce sia Firestore Timestamp objects che numeri legacy.
 * 
 * @param value - Il valore del timestamp da Firestore (Timestamp object o number)
 * @param fallback - Valore di fallback se il timestamp non è valido
 * @returns Millisecondi come numero
 */
export function normalizeTimestamp(value: any, fallback: number = 0): number {
    // Se è un Firestore Timestamp object, chiama toMillis()
    if (value && typeof value.toMillis === 'function') {
        return value.toMillis();
    }
    
    // Se è già un numero (legacy data), ritornalo così com'è
    if (typeof value === 'number') {
        return value;
    }
    
    // Altrimenti usa il fallback
    return fallback;
}

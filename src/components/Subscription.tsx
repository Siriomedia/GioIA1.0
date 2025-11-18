import React, { useEffect } from "react";
import { User, Plan } from "../types.ts";
import { PLANS, CREDIT_COSTS } from "../config/plans.ts";
import { CheckIcon } from "./common/Icons.tsx";

interface SubscriptionProps {
    user: User;
    onPlanChange: (plan: Plan) => void;
    onAddCredits: (credits: number) => void;
}

const PACKAGE_PRICES: Record<Plan, string> = {
    free: "0.00",
    basic: "0.99",
    medium: "1.99",
    premium: "2.99",
    professional: "5.99",
};

declare global {
    interface Window {
        paypal: any;
    }
}

const Subscription: React.FC<SubscriptionProps> = ({ user, onPlanChange, onAddCredits }) => {

    useEffect(() => {
        if (!window.paypal) return;

        (Object.keys(PLANS) as Plan[]).forEach((packageKey) => {
            if (packageKey === "free") return;

            const containerId = `paypal-button-${packageKey}`;
            const container = document.getElementById(containerId);
            if (container) container.innerHTML = "";

            window.paypal
                .Buttons({
                    style: {
                        layout: "vertical",
                        color: "blue",
                        shape: "pill",
                        label: "pay",
                    },

                    createOrder: (data: any, actions: any) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    description: `Pacchetto crediti: ${PLANS[packageKey].name}`,
                                    amount: { value: PACKAGE_PRICES[packageKey] },
                                },
                            ],
                        });
                    },

                    onApprove: async (data: any, actions: any) => {
                        const orderDetails = await actions.order.capture();
                        console.log('Pagamento completato:', orderDetails);

                        const creditsToAdd = PLANS[packageKey].credits;

                        onAddCredits(creditsToAdd);
                        onPlanChange(packageKey);

                        alert(
                            `✅ Pagamento completato con successo!\n\nPacchetto: ${PLANS[packageKey].name}\nCrediti aggiunti: ${creditsToAdd}\nNuovo saldo: ${user.credits + creditsToAdd} crediti\n\nGrazie per il tuo acquisto!`
                        );
                    },

                    onError: (err: any) => {
                        console.error("Errore PayPal:", err);
                        alert("Errore durante il pagamento. Riprova più tardi.");
                    },
                })
                .render(`#${containerId}`);
        });
    }, [onPlanChange, onAddCredits, user.credits]);

    return (
        <div className="p-3 sm:p-6">
            <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Ricarica i crediti</h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto px-4">
                    Acquista pacchetti di crediti che si aggiungono al tuo saldo attuale. Nessun abbonamento, nessun rinnovo automatico.
                </p>
                {user.role === 'admin' && (
                    <div className="mt-4 sm:mt-6 max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-center mb-2">
                            <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🔐</span>
                            <h3 className="text-lg sm:text-xl font-bold">Account Amministratore</h3>
                        </div>
                        <p className="text-sm sm:text-base text-blue-100">
                            Hai crediti <strong>ILLIMITATI</strong>. Tutte le funzionalità sono disponibili senza costi.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
                {(Object.keys(PLANS) as Plan[]).map((packageKey) => {
                    const pkg = PLANS[packageKey];
                    const isBestValue = packageKey === 'professional';

                    return (
                        <div
                            key={packageKey}
                            className={`border-2 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 flex flex-col relative ${
                                isBestValue ? 'border-blue-500 bg-blue-50' : "border-gray-200 bg-white"
                            }`}
                        >
                            {isBestValue && (
                                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                                    Più conveniente
                                </div>
                            )}

                            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isBestValue ? "text-blue-600" : "text-gray-800"}`}>
                                {pkg.name}
                            </h2>

                            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 flex-grow">{pkg.description}</p>

                            <div className="mb-6">
                                <span className="text-5xl font-extrabold text-gray-900">
                                    €{PACKAGE_PRICES[packageKey]}
                                </span>
                            </div>

                            <ul className="space-y-3 text-gray-600 mb-8">
                                {pkg.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {packageKey === "free" ? (
                                <div className="mt-auto py-4 px-6 text-center bg-gray-100 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">Saldo attuale:</div>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {user.role === 'admin' ? '∞' : user.credits}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {user.role === 'admin' ? 'crediti illimitati' : 'crediti'}
                                    </div>
                                    {user.role === 'admin' && (
                                        <div className="mt-2 text-xs text-blue-600 font-semibold">
                                            🔐 Account Admin
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div id={`paypal-button-${packageKey}`} className="mt-auto"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12 max-w-3xl mx-auto">
                <h3 className="font-bold text-gray-800 mb-3">ℹ️ Come funzionano i crediti</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                    <li>• I crediti acquistati si <strong>aggiungono</strong> al tuo saldo attuale</li>
                    <li>• Non scadono e non si rinnovano automaticamente</li>
                    <li>• Puoi acquistare più pacchetti quando vuoi</li>
                    <li>• Pagamento sicuro tramite PayPal</li>
                </ul>
            </div>
        </div>
    );
};

export default Subscription;

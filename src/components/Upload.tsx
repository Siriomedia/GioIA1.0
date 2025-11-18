import React, { useState, useCallback } from 'react';
import { analyzePayslip } from '../services/geminiService.ts';
import { Payslip } from '../types.ts';
import Spinner from './common/Spinner.tsx';
import { UploadIcon } from './common/Icons.tsx';
import { CREDIT_COSTS } from '../config/plans.ts';

interface UploadProps {
    onAnalysisComplete: (payslip: Payslip) => void;
    handleCreditConsumption: (cost: number) => boolean;
}

const Upload: React.FC<UploadProps> = ({ onAnalysisComplete, handleCreditConsumption }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (['image/jpeg', 'image/png', 'application/pdf'].includes(droppedFile.type)) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Formato file non supportato. Usa PDF, JPG, o PNG.');
            }
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);


    const handleSubmit = async () => {
        if (!file) {
            setError('Per favore, seleziona un file da caricare.');
            return;
        }

        if (!handleCreditConsumption(CREDIT_COSTS.PAYSLIP_ANALYSIS)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const payslipData = await analyzePayslip(file);
            onAnalysisComplete(payslipData);
        } catch (err) {
            setError('Analisi fallita. Assicurati che il documento sia una busta paga leggibile e riprova.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Carica Busta Paga</h1>
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-md">
                {isLoading ? (
                    <div className="text-center">
                        <Spinner />
                        <p className="mt-4 text-base sm:text-lg font-semibold text-blue-600">Analisi in corso...</p>
                        <p className="text-sm sm:text-base text-gray-500">L'IA sta leggendo la tua busta paga. Potrebbe volerci un momento.</p>
                    </div>
                ) : (
                    <>
                        <label
                            htmlFor="file-upload"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`flex flex-col items-center justify-center w-full p-6 sm:p-8 md:p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                        >
                            <UploadIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
                            <div className="text-center">
                                <span className="text-sm sm:text-base text-blue-600 font-semibold">Scegli un file</span>
                                <span className="text-sm sm:text-base text-gray-500 ml-1">o trascinalo qui</span>
                            </div>
                            <input id="file-upload" name="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-2">PDF, PNG, JPG (MAX. 10MB)</p>
                        </label>

                        {file && (
                            <div className="mt-4 sm:mt-6 text-center font-medium text-sm sm:text-base text-gray-700">
                                File selezionato: <span className="break-all">{file.name}</span>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 text-center text-sm sm:text-base text-red-600 bg-red-100 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="mt-6 sm:mt-8 text-center">
                            <button
                                onClick={handleSubmit}
                                disabled={!file || isLoading}
                                className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="hidden sm:inline">Analizza Documento (-{CREDIT_COSTS.PAYSLIP_ANALYSIS} crediti)</span>
                                <span className="sm:hidden">Analizza (-{CREDIT_COSTS.PAYSLIP_ANALYSIS})</span>
                            </button>
                        </div>
                    </>
                )}
                 <div className="mt-8 text-center text-sm text-gray-500">
                    <p>I tuoi documenti sono trattati con la massima riservatezza e non vengono memorizzati permanentemente sui nostri server dopo l'analisi.</p>
                </div>
            </div>
        </div>
    );
};

export default Upload;
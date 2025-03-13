import React from 'react';
import { translations } from '../translations';
import { Info } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">{translations.settings}</h2>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Cette application utilise une base de données locale stockée dans votre navigateur. 
              Toutes les données sont conservées sur votre appareil.
            </p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">À propos de l'application</h3>
          <p className="text-sm text-gray-600 mb-2">
            Gestionnaire de Stock est une application qui vous permet de gérer votre inventaire, 
            suivre vos ventes et analyser vos bénéfices.
          </p>
          <p className="text-sm text-gray-600">
            Version: 1.0.0
          </p>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Fonctionnalités</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Gestion des produits avec prix d'achat et prix de vente</li>
            <li>Suivi des ventes avec calcul automatique des bénéfices</li>
            <li>Application de remises sur les ventes</li>
            <li>Rapports détaillés sur les ventes et les bénéfices</li>
            <li>Base de données locale pour une utilisation hors ligne</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
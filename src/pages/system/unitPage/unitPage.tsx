/**
 * @author Dakota Soares
 * @version 1.1
 * @description Unit Management Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../config/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import MessagePopup from '../../../components/MessagePopup/MessagePopup';
import Popup from '../../../components/Popup/Popup';
import MeatballMenu from '../../../components/MeatballMenu/MeatballMenu';
import { Unit } from '../../../components/types';
import './unitPage.css';

const UnitPage: React.FC = () => {
  const [solidUnits, setSolidUnits] = useState<Unit[]>([]);
  const [liquidUnits, setLiquidUnits] = useState<Unit[]>([]);
  const [showAddSolidPopup, setShowAddSolidPopup] = useState<boolean>(false);
  const [showAddLiquidPopup, setShowAddLiquidPopup] = useState<boolean>(false);
  const [showUpdateSolidPopup, setShowUpdateSolidPopup] = useState<boolean>(false);
  const [showUpdateLiquidPopup, setShowUpdateLiquidPopup] = useState<boolean>(false);
  const [selectedSolidUnit, setSelectedSolidUnit] = useState<Unit | null>(null);
  const [selectedLiquidUnit, setSelectedLiquidUnit] = useState<Unit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [menuCollapsed] = useState(false);

  const fetchSolidUnits = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/unit/solid');
      setSolidUnits(response.data);
    } catch (err: any) {
      setError('Error: Could not retrieve the Solid Unit List');
    }
  }, []);

  const fetchLiquidUnits = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/unit/liquid');
      setLiquidUnits(response.data);
    } catch (err: any) {
      setError('Error: Could not retrieve the Liquid Unit List');
    }
  }, []);

  useEffect(() => {
    fetchSolidUnits();
    fetchLiquidUnits();
  }, [fetchLiquidUnits, fetchSolidUnits]);

  const handleAddSolidUnit = async (quantityUnit: string, quantityUnitCode: string) => {
    try {
      await apiClient.post('/system/unit/solid', { quantityUnit, quantityUnitCode });
      fetchSolidUnits();
      setShowAddSolidPopup(false);
      setMessage('Message: The solid unit was added successfully');
    } catch (err: any) {
      setError('Error: The solid unit could not be added');
    }
  };

  const handleAddLiquidUnit = async (quantityUnit: string, quantityUnitCode: string) => {
    try {
      await apiClient.post('/system/unit/liquid', { quantityUnit, quantityUnitCode });
      fetchLiquidUnits();
      setShowAddLiquidPopup(false);
      setMessage('Message: The liquid unit was added successfully');
    } catch (err: any) {
      setError('Error: The liquid unit could not be added');
    }
  };

  const handleUpdateSolidUnit = async (
    id: number,
    quantityUnit: string,
    quantityUnitCode: string
  ) => {
    try {
      await apiClient.patch(`/system/unit/solid/${id}`, { quantityUnit, quantityUnitCode });
      fetchSolidUnits();
      setShowUpdateSolidPopup(false);
      setMessage('Message: The solid unit was updated successfully');
    } catch (err: any) {
      setError('Error: The solid unit could not be updated');
    }
  };

  const handleUpdateLiquidUnit = async (
    id: number,
    quantityUnit: string,
    quantityUnitCode: string
  ) => {
    try {
      await apiClient.patch(`/system/unit/liquid/${id}`, { quantityUnit, quantityUnitCode });
      fetchLiquidUnits();
      setShowUpdateLiquidPopup(false);
      setMessage('Message: The liquid unit was updated successfully');
    } catch (err: any) {
      setError('Error: The liquid unit could not be updated');
    }
  };

  const handleDeleteSolidUnit = async (id: number) => {
    try {
      await apiClient.delete(`/system/unit/solid/${id}`);
      fetchSolidUnits();
      setMessage('Message: The solid unit was deleted successfully');
    } catch (err: any) {
      setError('Error: The solid unit could not be deleted');
    }
  };

  const handleDeleteLiquidUnit = async (id: number) => {
    try {
      await apiClient.delete(`/system/unit/liquid/${id}`);
      fetchLiquidUnits();
      setMessage('Message: The liquid unit was deleted successfully');
    } catch (err: any) {
      setError('Error: The liquid unit could not be deleted');
    }
  };

  const openUpdateSolidPopup = (unit: Unit) => {
    setSelectedSolidUnit(unit);
    setShowUpdateSolidPopup(true);
  };

  const openUpdateLiquidPopup = (unit: Unit) => {
    setSelectedLiquidUnit(unit);
    setShowUpdateLiquidPopup(true);
  };

  return (
    <Layout>
      <div className={`unit-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">Units</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}
        {message && <MessagePopup message={message} onClose={() => setMessage(null)} />}

        <div className="unit-tables-container">
          <div className="unit-table-wrapper">
            <h2>Solid Units</h2>
            <button className="add-unit-button" onClick={() => setShowAddSolidPopup(true)}>Add Solid Unit</button>
            <table className="unit-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {solidUnits.map((unit) => (
                  <tr key={unit.id}>
                    <td>{unit.quantityUnit}</td>
                    <td>{unit.quantityUnitCode}</td>
                    <td>
                      <MeatballMenu
                        options={[
                          {
                            label: 'Update',
                            onClick: () => openUpdateSolidPopup(unit),
                          },
                          {
                            label: 'Remove',
                            onClick: () => handleDeleteSolidUnit(unit.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="unit-table-wrapper">
            <h2>Liquid Units</h2>
            <button className="add-unit-button" onClick={() => setShowAddLiquidPopup(true)}>Add Liquid Unit</button>
            <table className="unit-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {liquidUnits.map((unit) => (
                  <tr key={unit.id}>
                    <td>{unit.quantityUnit}</td>
                    <td>{unit.quantityUnitCode}</td>
                    <td>
                      <MeatballMenu
                        options={[
                          {
                            label: 'Update',
                            onClick: () => openUpdateLiquidPopup(unit),
                          },
                          {
                            label: 'Remove',
                            onClick: () => handleDeleteLiquidUnit(unit.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddSolidPopup && (
          <Popup title="Add Solid Unit" onClose={() => setShowAddSolidPopup(false)}>
            <UnitForm
              onSubmit={(quantityUnit, quantityUnitCode) =>
                handleAddSolidUnit(quantityUnit, quantityUnitCode)
              }
              onCancel={() => setShowAddSolidPopup(false)}
            />
          </Popup>
        )}

        {showAddLiquidPopup && (
          <Popup title="Add Liquid Unit" onClose={() => setShowAddLiquidPopup(false)}>
            <UnitForm
              onSubmit={(quantityUnit, quantityUnitCode) =>
                handleAddLiquidUnit(quantityUnit, quantityUnitCode)
              }
              onCancel={() => setShowAddLiquidPopup(false)}
            />
          </Popup>
        )}

        {showUpdateSolidPopup && selectedSolidUnit && (
          <Popup title="Update Solid Unit" onClose={() => setShowUpdateSolidPopup(false)}>
            <UnitForm
              initialQuantityUnit={selectedSolidUnit.quantityUnit}
              initialQuantityUnitCode={selectedSolidUnit.quantityUnitCode}
              onSubmit={(quantityUnit, quantityUnitCode) =>
                handleUpdateSolidUnit(selectedSolidUnit.id, quantityUnit, quantityUnitCode)
              }
              onCancel={() => setShowUpdateSolidPopup(false)}
            />
          </Popup>
        )}

        {showUpdateLiquidPopup && selectedLiquidUnit && (
          <Popup title="Update Liquid Unit" onClose={() => setShowUpdateLiquidPopup(false)}>
            <UnitForm
              initialQuantityUnit={selectedLiquidUnit.quantityUnit}
              initialQuantityUnitCode={selectedLiquidUnit.quantityUnitCode}
              onSubmit={(quantityUnit, quantityUnitCode) =>
                handleUpdateLiquidUnit(selectedLiquidUnit.id, quantityUnit, quantityUnitCode)
              }
              onCancel={() => setShowUpdateLiquidPopup(false)}
            />
          </Popup>
        )}
      </div>
    </Layout>
  );
};

interface UnitFormProps {
  initialQuantityUnit?: string;
  initialQuantityUnitCode?: string;
  onSubmit: (quantityUnit: string, quantityUnitCode: string) => void;
  onCancel: () => void;
}

const UnitForm: React.FC<UnitFormProps> = ({
  initialQuantityUnit = '',
  initialQuantityUnitCode = '',
  onSubmit,
  onCancel,
}) => {
  const [quantityUnit, setQuantityUnit] = useState(initialQuantityUnit);
  const [quantityUnitCode, setQuantityUnitCode] = useState(initialQuantityUnitCode);

  return (
    <div className="unit-form">
      <label>Unit</label>
      <input
        type="text"
        value={quantityUnit}
        onChange={(e) => setQuantityUnit(e.target.value)}
        required
      />
      <label>Code</label>
      <input
        type="text"
        value={quantityUnitCode}
        onChange={(e) => setQuantityUnitCode(e.target.value)}
        required
      />
      <div className="form-actions">
        <button onClick={() => onSubmit(quantityUnit, quantityUnitCode)}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default UnitPage;
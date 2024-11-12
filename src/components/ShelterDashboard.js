import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { FiCamera, FiEdit, FiClipboard, FiSend } from 'react-icons/fi';
import { QrReader } from 'react-qr-reader';
import ScannedDataTable from './ScannedDataTable';
const ShelterDashboard = ({ user }) => {
    const [shelterData, setShelterData] = useState(null);
    const [tempData, setTempData] = useState({});
    const [isEditBedInfoOpen, setIsEditBedInfoOpen] = useState(false);
    const [scannedData, setScannedData] = useState(null); // For scanned QR data
    const [isScannerVisible, setIsScannerVisible] = useState(false); // Toggle QR scanner modal visibility
    const db = getFirestore();

    useEffect(() => {
        const fetchShelterData = async () => {
            if (user) {
                const shelterRef = doc(db, 'charityDetails', user.uid);
                const shelterDoc = await getDoc(shelterRef);

                if (shelterDoc.exists()) {
                    setShelterData(shelterDoc.data());
                } else {
                    console.error("No charity data found for this user.");
                }
            }
        };
        fetchShelterData();
    }, [db, user]);

    const openEditBedInfo = () => {
        setTempData({
            bedsAvailable: shelterData.bedsAvailable,
            ratePerDay: shelterData.ratePerDay,
        });
        setIsEditBedInfoOpen(true);
    };
    const closeEditBedInfo = () => setIsEditBedInfoOpen(false);

    const handleScan = (data) => {
        if (data) {
            try {
                const parsedData = JSON.parse(data); // Parse the scanned data
                setScannedData(parsedData); // Store parsed data in state
                setIsScannerVisible(false); // Close scanner modal
            } catch (error) {
                console.error("Invalid QR data format:", error);
            }
        }
    };

    const handleError = (error) => {
        console.error("QR scanner error:", error);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const saveChanges = async () => {
        if (user) {
            const shelterRef = doc(db, 'charityDetails', user.uid);
            await updateDoc(shelterRef, tempData);
            setShelterData((prevData) => ({
                ...prevData,
                ...tempData,
            }));
            closeEditBedInfo();
        }
    };

    const userEmail = user ? user.email : "Loading...";

    if (!shelterData) return <p>Loading charity details...</p>;

    const toggleScanner = () => {
        setIsScannerVisible(true); // Always open scanner
    };

    const closeScanner = () => {
        setIsScannerVisible(false); // Close scanner
        setScannedData(null); // Clear scanned data when closing
    };

    return (
        <div className="p-4 md:p-8">
            {/* Quick Actions */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold">Shelter Dashboard</h2>
                <div className="flex space-x-4">
                    <button className="bg-green-500 text-white py-2 px-4 rounded shadow hover:bg-green-600 flex items-center">
                        <FiClipboard className="mr-2" /> Recent Donations
                    </button>
                    <button className="bg-purple-500 text-white py-2 px-4 rounded shadow hover:bg-purple-600 flex items-center">
                        <FiSend className="mr-2" /> Send Update to Donors
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Section 1: Shelter Overview */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Shelter Overview</h3>
                    <p className="text-lg font-bold">Charity Name: {shelterData.charityName}</p>
                    <p className="text-lg font-bold">Total Beds: {shelterData.bedsAvailable}</p>
                    <p className="text-lg font-bold">Charity Registration Number: {shelterData.registrationNumber}</p>
                </div>

                {/* Section 2: Contact Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                    <p><span className="font-bold">Email:</span> {userEmail}</p>
                    <p><span className="font-bold">Phone:</span> {shelterData.contactNumber}</p>
                    <p><span className="font-bold">Address:</span> {shelterData.address}</p>
                </div>

                {/* Section 3: Bed Information */}
                <div className="bg-white p-6 rounded-lg shadow-md relative">
                    <h3 className="text-xl font-semibold mb-4">Bed Information</h3>
                    <p><span className="font-bold">Beds Available:</span> {shelterData.bedsAvailable}</p>
                    <p><span className="font-bold">Rate per Day:</span> £{shelterData.ratePerDay}</p>
                    <button
                        onClick={openEditBedInfo}
                        className="absolute top-2 right-2 text-blue-500 hover:text-blue-600 transition-transform duration-300 transform hover:scale-110"
                    >
                        <FiEdit className="text-2xl" />
                    </button>
                </div>

                {/* Section 4: Financial Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Bank Account Information</h3>
                    <p>{shelterData.bankAccountDetails}</p>
                </div>
            </div>

            {/* Scan Button */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={toggleScanner}
                    className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 flex items-center"
                >
                    <FiCamera className="mr-2" />
                    {isScannerVisible ? "Hide Scanner" : "Scan QR Code"}
                </button>
            </div>

            {/* QR Code Scanner Modal */}
            {isScannerVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Scan QR Code</h3>
                        <QrReader
                            onResult={(result, error) => {
                                if (result) {
                                    handleScan(result.text);
                                }
                                if (error) {
                                    handleError(error);
                                }
                            }}
                            style={{ width: '100%' }}
                        />
                        <button
                            onClick={closeScanner}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Scanned Data Table */}
            {scannedData && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Scanned Data</h3>
                        <ScannedDataTable data={scannedData} />
                        <button
                            onClick={() => {
                                setScannedData(null); // Clear scanned data
                                closeScanner(); // Close scanner
                            }}
                            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Bed Information Modal */}
            {isEditBedInfoOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Edit Bed Information</h3>
                        <div>
                            <label className="block mb-2" htmlFor="bedsAvailable">Beds Available</label>
                            <input
                                id="bedsAvailable"
                                name="bedsAvailable"
                                type="number"
                                value={tempData.bedsAvailable}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-2 rounded-md w-full"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2" htmlFor="ratePerDay">Rate per Day (£)</label>
                            <input
                                id="ratePerDay"
                                name="ratePerDay"
                                type="number"
                                value={tempData.ratePerDay}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-2 rounded-md w-full"
                            />
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={saveChanges}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
                            >
                                Save
                            </button>
                            <button
                                onClick={closeEditBedInfo}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShelterDashboard;
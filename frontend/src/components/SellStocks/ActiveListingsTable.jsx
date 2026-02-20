import React from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const ListingRow = ({ listing, onEdit, onDelete }) => {
    const status = listing.status.charAt(0).toUpperCase() + listing.status.slice(1);
    const isReserved = status === 'Reserved';

    return (
        <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td className="py-4 px-4">
                <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
            </td>
            <td className="py-4 px-4 text-sm text-gray-600">{listing.category}</td>
            <td className="py-4 px-4 text-sm text-gray-600">{listing.quantity}</td>
            <td className="py-4 px-4 text-sm text-gray-600">{listing.current_weight || 'N/A'}</td>
            <td className="py-4 px-4 text-sm text-gray-600">{listing.currency} {listing.base_price}</td>
            <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isReserved ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {status}
                </span>
            </td>
            <td className="py-4 px-4 flex gap-2 text-gray-400">
                <EditOutlinedIcon
                    fontSize="small"
                    className="cursor-pointer hover:text-green-600"
                    onClick={() => onEdit(listing)}
                />
                <DeleteOutlineOutlinedIcon
                    fontSize="small"
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => onDelete(listing.product_id)}
                />
            </td>
        </tr>
    );
};

const ActiveListingsTable = ({ listings, loading, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 mb-8 overflow-x-auto">
            <h4 className="font-bold text-gray-800 mb-6">Active Listings Table</h4>

            <table className="w-full min-w-[700px] text-left">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 w-10">
                            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        </th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Animal</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase"><span className="flex items-center gap-1">Qty ⏷</span></th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase"><span className="flex items-center gap-1">Weight ⏷</span></th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase"><span className="flex items-center gap-1">Asking Price ⏷</span></th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase"><span className="flex items-center gap-1">Status ⏷</span></th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="py-10 text-center text-gray-500">Loading listings...</td>
                        </tr>
                    ) : listings.length > 0 ? (
                        listings.map((listing) => (
                            <ListingRow
                                key={listing.product_id}
                                listing={listing}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="py-10 text-center text-gray-500">No active listings found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ActiveListingsTable;

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className='bg-emerald-100 p-5 flex justify-center items-center'>
            <div className='text-lg font-bold'>Text To PDF Converter</div>
            <div className='ml-auto flex text-gray-900 text-sm'>
                <button
                    className={`m-1 rounded p-2 ${location.pathname === '/upload' || location.pathname === '/' ? 'bg-gray-900 text-gray-50' : 'hover:bg-gray-900 hover:text-gray-50'}`}
                    onClick={() => navigate('/upload')}
                >
                    Upload
                </button>
                <button
                    className={`m-1 rounded p-1 ${location.pathname === '/download' ? 'bg-gray-900 text-gray-50' : 'hover:bg-gray-900 hover:text-gray-50'}`}
                    onClick={() => navigate('/download')}
                >
                    Download
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
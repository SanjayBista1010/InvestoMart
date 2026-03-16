import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export const useUserProfile = () => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const data = await userService.getProfileSummary();

                if (data.success) {
                    setProfileData(data);
                } else {
                    setError('Failed to load profile data.');
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError('An error occurred while fetching your profile.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    return { profileData, isLoading, error };
};

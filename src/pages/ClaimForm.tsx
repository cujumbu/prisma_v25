import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ClaimFormData {
  orderNumber: string;
  email: string;
  name: string;
  address: string;
  phoneNumber: string;
  brand: string;
  problemDescription: string;
}

const ClaimForm: React.FC = () => {
  const [formData, setFormData] = useState<ClaimFormData>({
    orderNumber: '',
    email: '',
    name: '',
    address: '',
    phoneNumber: '',
    brand: '',
    problemDescription: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit claim');
      }
      const newClaim = await response.json();
      navigate('/status', { state: { claimId: newClaim.id } });
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError(`Failed to submit claim: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component remains the same
};

export default ClaimForm;

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PropertyCard from '../../components/shared/PropertyCard';

const mockProperty = {
  id: '1',
  name: 'فندق الريتز كارلتون الرياض',
  type: 'hotel' as const,
  location: 'الرياض',
  price: 1200,
  rating: 4.9,
  image: 'https://example.com/image.jpg',
  features: ['واي فاي مجاني', 'مسبح', 'سبا', 'مطعم']
};

const PropertyCardWrapper = () => (
  <BrowserRouter>
    <PropertyCard property={mockProperty} />
  </BrowserRouter>
);

describe('PropertyCard Component', () => {
  it('renders property information correctly', () => {
    render(<PropertyCardWrapper />);
    
    expect(screen.getByText('فندق الريتز كارلتون الرياض')).toBeInTheDocument();
    expect(screen.getByText('الرياض')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('فندق')).toBeInTheDocument();
  });

  it('displays property features', () => {
    render(<PropertyCardWrapper />);
    
    expect(screen.getByText('واي فاي مجاني')).toBeInTheDocument();
    expect(screen.getByText('مسبح')).toBeInTheDocument();
  });

  it('shows correct property type badge', () => {
    render(<PropertyCardWrapper />);
    
    expect(screen.getByText('فندق')).toBeInTheDocument();
  });

  it('has correct link to property details', () => {
    render(<PropertyCardWrapper />);
    
    const detailsLink = screen.getByText('عرض التفاصيل');
    expect(detailsLink.closest('a')).toHaveAttribute('href', '/property/1');
  });
});
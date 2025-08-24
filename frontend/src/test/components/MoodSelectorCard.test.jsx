import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MoodSelectorCard from '../../components/MoodSelectorCard';

const mockMoods = [
  { id: "feliz", label: "Feliz", emoji: "☀️", color: "text-amber-500" },
  { id: "relajado", label: "Relajado", emoji: "😊", color: "text-emerald-600" },
];

describe('MoodSelectorCard', () => {
  it('renders mood selector with moods', () => {
    const onMoodChange = vi.fn();
    
    render(
      <MoodSelectorCard
        currentMood="feliz"
        onMoodChange={onMoodChange}
        moods={mockMoods}
      />
    );

    expect(screen.getByText('¿Cómo te sientes hoy?')).toBeInTheDocument();
    expect(screen.getByText('Feliz')).toBeInTheDocument();
    expect(screen.getByText('Relajado')).toBeInTheDocument();
  });

  it('calls onMoodChange when a mood is clicked', () => {
    const onMoodChange = vi.fn();
    
    render(
      <MoodSelectorCard
        currentMood="feliz"
        onMoodChange={onMoodChange}
        moods={mockMoods}
      />
    );

    fireEvent.click(screen.getByText('Relajado'));
    expect(onMoodChange).toHaveBeenCalledWith('relajado');
  });

  it('highlights the current mood', () => {
    const onMoodChange = vi.fn();
    
    render(
      <MoodSelectorCard
        currentMood="feliz"
        onMoodChange={onMoodChange}
        moods={mockMoods}
      />
    );

    const activeButton = screen.getByLabelText('Seleccionar mood Feliz');
    expect(activeButton).toHaveAttribute('aria-pressed', 'true');
    expect(activeButton).toHaveClass('bg-emerald-600');
  });

  it('supports keyboard navigation', () => {
    const onMoodChange = vi.fn();
    
    render(
      <MoodSelectorCard
        currentMood="feliz"
        onMoodChange={onMoodChange}
        moods={mockMoods}
      />
    );

    const relajadoButton = screen.getByLabelText('Seleccionar mood Relajado');
    relajadoButton.focus();
    fireEvent.keyDown(relajadoButton, { key: 'Enter' });
    
    expect(onMoodChange).toHaveBeenCalledWith('relajado');
  });
});

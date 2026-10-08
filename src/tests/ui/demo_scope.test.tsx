import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../../App';

afterEach(cleanup);

describe('Public demonstration scope', () => {
  it('explains synthetic data and non-clinical status before using the interface', () => {
    render(<App />);
    const notice = screen.getByRole('complementary', { name: 'Alcance de la demostración' });
    expect(notice.textContent).toContain('no validada para uso clínico ni pericial');
    expect(notice.textContent).toContain('No introduzcas datos de pacientes');
    expect(screen.getByText('Demo técnica')).toBeDefined();
  });

  it('keeps a non-clinical notice inside the printable report', () => {
    render(<App />);
    const report = screen.getByTestId('clinical-report-view');
    expect(report.textContent).toContain('SIN VALIDEZ CLÍNICA NI PERICIAL');
    expect(report.querySelector('[aria-label="Aviso del informe de demostración"]')?.className).not.toContain('print:hidden');
  });
});

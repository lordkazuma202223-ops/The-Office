import { render, screen, fireEvent } from '@testing-library/react';
import CommandInput from '../CommandInput';

describe('CommandInput', () => {
  it('renders input field and submit button', () => {
    render(<CommandInput onCommand={jest.fn()} />);

    expect(screen.getByPlaceholderText(/enter command/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
  });

  it('calls onCommand with trimmed command on submit', () => {
    const handleCommand = jest.fn();
    render(<CommandInput onCommand={handleCommand} />);

    const input = screen.getByPlaceholderText(/enter command/i);
    const button = screen.getByRole('button', { name: /execute/i });

    fireEvent.change(input, { target: { value: '  test command  ' } });
    fireEvent.click(button);

    expect(handleCommand).toHaveBeenCalledWith('test command');
  });

  it('submits on form submit', () => {
    const handleCommand = jest.fn();
    render(<CommandInput onCommand={handleCommand} />);

    const input = screen.getByPlaceholderText(/enter command/i);
    fireEvent.change(input, { target: { value: 'test command' } });

    fireEvent.submit(input.closest('form')!);

    expect(handleCommand).toHaveBeenCalledWith('test command');
  });

  it('does not submit empty command', () => {
    const handleCommand = jest.fn();
    render(<CommandInput onCommand={handleCommand} />);

    const button = screen.getByRole('button', { name: /execute/i });
    fireEvent.click(button);

    expect(handleCommand).not.toHaveBeenCalled();
  });

  it('disables input and button when disabled prop is true', () => {
    render(<CommandInput onCommand={jest.fn()} disabled />);

    const input = screen.getByPlaceholderText(/enter command/i);
    const button = screen.getByRole('button', { name: /execute/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('clears input after successful submission', () => {
    const handleCommand = jest.fn();
    render(<CommandInput onCommand={handleCommand} />);

    const input = screen.getByPlaceholderText(/enter command/i) as HTMLInputElement;
    const button = screen.getByRole('button', { name: /execute/i });

    fireEvent.change(input, { target: { value: 'test command' } });
    fireEvent.click(button);

    expect(input.value).toBe('');
  });

  it('uses custom placeholder when provided', () => {
    render(
      <CommandInput
        onCommand={jest.fn()}
        placeholder="Send command to agent..."
      />
    );

    expect(screen.getByPlaceholderText('Send command to agent...')).toBeInTheDocument();
  });
});

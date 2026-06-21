import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { EditOutgoingGatePassSheet } from '@/features/outgoing/forms/edit-outgoing-gate-pass-sheet';
import {
  makeOutgoingDaybookEntry,
} from '@/test/fixtures';
import { renderWithProviders, screen, user, waitFor } from '@/test/test-utils';

const mockUpdateOutgoingGatePass = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/features/outgoing/api/use-update-outgoing-gate-pass', () => ({
  useUpdateOutgoingGatePass: () => ({
    mutateAsync: mockUpdateOutgoingGatePass,
    isPending: false,
  }),
}));

function renderSheet(
  props: Partial<React.ComponentProps<typeof EditOutgoingGatePassSheet>> = {},
) {
  const onOpenChange = vi.fn();
  const entry = props.entry ?? makeOutgoingDaybookEntry();

  renderWithProviders(
    <EditOutgoingGatePassSheet
      entry={entry}
      open={props.open ?? true}
      onOpenChange={props.onOpenChange ?? onOpenChange}
    />,
  );

  return { onOpenChange, entry };
}

describe('EditOutgoingGatePassSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateOutgoingGatePass.mockResolvedValue(undefined);
  });

  it('renders the sheet header with gate pass number and farmer name', async () => {
    renderSheet();

    expect(
      await screen.findByRole('heading', { name: /edit ogp #24/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
  });

  it('pre-fills fields from the daybook entry', async () => {
    renderSheet();

    expect(await screen.findByDisplayValue('56')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cold Storage A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mandi Delhi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('HR-26-AB-1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Morning dispatch')).toBeInTheDocument();
  });

  it('shows a no-changes toast when saving without edits', async () => {
    renderSheet();

    await user.click(await screen.findByRole('button', { name: /save changes/i }));

    expect(toast.info).toHaveBeenCalledWith('No changes to save', {
      position: 'bottom-right',
    });
    expect(mockUpdateOutgoingGatePass).not.toHaveBeenCalled();
  });

  it('sends only changed fields on save', async () => {
    const { entry } = renderSheet();

    const remarksField = await screen.findByDisplayValue('Morning dispatch');
    await user.clear(remarksField);
    await user.type(remarksField, 'Updated remarks');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateOutgoingGatePass).toHaveBeenCalledWith({
        id: entry._id,
        payload: { remarks: 'Updated remarks' },
      });
    });
  });

  it('closes the sheet and shows success toast after a successful save', async () => {
    const { onOpenChange, entry } = renderSheet();

    const remarksField = await screen.findByDisplayValue('Morning dispatch');
    await user.clear(remarksField);
    await user.type(remarksField, 'Corrected remarks');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        `Outgoing gate pass #${entry.gatePassNo.toLocaleString('en-IN')} updated`,
        { position: 'bottom-right' },
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows an error toast when save fails', async () => {
    mockUpdateOutgoingGatePass.mockRejectedValue(new Error('Update failed'));

    const { onOpenChange } = renderSheet();

    const remarksField = await screen.findByDisplayValue('Morning dispatch');
    await user.clear(remarksField);
    await user.type(remarksField, 'Corrected remarks');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Update failed', {
        position: 'bottom-right',
      });
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('closes on cancel and resets values when reopened', async () => {
    function TestHarness() {
      const [open, setOpen] = useState(true);

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Reopen sheet
          </button>
          <EditOutgoingGatePassSheet
            entry={makeOutgoingDaybookEntry()}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      );
    }

    renderWithProviders(<TestHarness />);

    const remarksField = await screen.findByDisplayValue('Morning dispatch');
    await user.clear(remarksField);
    await user.type(remarksField, 'Temporary edit');

    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /edit ogp #24/i }),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /reopen sheet/i }));

    expect(await screen.findByDisplayValue('Morning dispatch')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Temporary edit')).not.toBeInTheDocument();
  });

  it('sends empty remarks in the update payload when remarks are cleared', async () => {
    const { entry } = renderSheet();

    const remarksField = await screen.findByDisplayValue('Morning dispatch');
    await user.clear(remarksField);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateOutgoingGatePass).toHaveBeenCalledWith({
        id: entry._id,
        payload: { remarks: '' },
      });
    });
  });
});

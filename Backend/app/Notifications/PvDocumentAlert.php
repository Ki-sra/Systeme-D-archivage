<?php

namespace App\Notifications;

use App\Models\PvDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Generic PV document alert notification.
 * Sent via the database channel for in-app bell notifications.
 */
class PvDocumentAlert extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string      $alertType,   // 'created' | 'status_changed' | 'missing' | 'reminder'
        public readonly string      $title,
        public readonly string      $message,
        public readonly ?int        $pvDocumentId = null,
        public readonly ?string     $pvDocumentLabel = null,
    ) {}

    /** Only database channel for in-app notifications */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** Payload stored in the data column */
    public function toDatabase(object $notifiable): array
    {
        return [
            'alert_type'       => $this->alertType,
            'title'            => $this->title,
            'message'          => $this->message,
            'pv_document_id'   => $this->pvDocumentId,
            'pv_document_label'=> $this->pvDocumentLabel,
        ];
    }
}

<?php
/**
 * Aksara Land — Lightweight Shared Hosting PHP API
 * Upload seluruh folder dist/ bersama file api.php ini ke public_html (Niagahoster / cPanel / hPanel).
 * Pastikan folder tempat api.php berada memiliki izin tulis (chmod 755) untuk menyimpan aksara_data.json.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/aksara_data.json';

function readStore(string $file): array {
    if (!file_exists($file)) {
        return [
            'properties' => [],
            'leads' => [],
            'settings' => null,
        ];
    }
    $raw = file_get_contents($file);
    $decoded = json_decode($raw ?: '{}', true);
    return is_array($decoded) ? $decoded : ['properties' => [], 'leads' => [], 'settings' => null];
}

function writeStore(string $file, array $data): bool {
    return file_put_contents(
        $file,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    ) !== false;
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input') ?: '{}', true);
if (!is_array($input)) {
    $input = [];
}

$store = readStore($dataFile);

switch ($action) {
    case 'get_init':
        echo json_encode(['ok' => true, 'data' => $store]);
        break;

    case 'add_lead':
        $lead = [
            'id' => $input['id'] ?? ('lead-' . time()),
            'createdAt' => $input['createdAt'] ?? date('c'),
            'name' => trim((string)($input['name'] ?? '')),
            'phone' => trim((string)($input['phone'] ?? '')),
            'propertyId' => (string)($input['propertyId'] ?? ''),
            'propertyName' => trim((string)($input['propertyName'] ?? 'Umum')),
            'cluster' => trim((string)($input['cluster'] ?? '-')),
            'source' => trim((string)($input['source'] ?? 'Konsultasi Marketing')),
            'status' => trim((string)($input['status'] ?? 'New Lead')),
            'salesNote' => trim((string)($input['salesNote'] ?? '')),
            'kprSummary' => isset($input['kprSummary']) ? trim((string)$input['kprSummary']) : null,
        ];
        array_unshift($store['leads'], $lead);
        writeStore($dataFile, $store);
        echo json_encode(['ok' => true, 'data' => $lead]);
        break;

    case 'update_lead':
        $id = (string)($input['id'] ?? '');
        foreach ($store['leads'] as &$lead) {
            if (($lead['id'] ?? '') === $id) {
                if (isset($input['status'])) $lead['status'] = (string)$input['status'];
                if (isset($input['salesNote'])) $lead['salesNote'] = (string)$input['salesNote'];
                break;
            }
        }
        writeStore($dataFile, $store);
        echo json_encode(['ok' => true, 'data' => ['id' => $id]]);
        break;

    case 'delete_lead':
        $id = (string)($input['id'] ?? '');
        $store['leads'] = array_values(array_filter(
            $store['leads'],
            fn($item) => ($item['id'] ?? '') !== $id
        ));
        writeStore($dataFile, $store);
        echo json_encode(['ok' => true, 'data' => ['id' => $id]]);
        break;

    case 'save_property':
        $id = (string)($input['id'] ?? '');
        $found = false;
        foreach ($store['properties'] as &$prop) {
            if (($prop['id'] ?? '') === $id) {
                $prop = $input;
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($store['properties'], $input);
        }
        writeStore($dataFile, $store);
        echo json_encode(['ok' => true, 'data' => $input]);
        break;

    case 'delete_property':
        $id = (string)($input['id'] ?? '');
        $store['properties'] = array_values(array_filter(
            $store['properties'],
            fn($item) => ($item['id'] ?? '') !== $id
        ));
        writeStore($dataFile, $store);
        echo json_encode(['ok' => true, 'data' => ['id' => $id]]);
        break;

    case 'save_settings':
        $store['settings'] = $input;
        writeStore($dataFile, $store);
        echo json_encode(['ok' => true, 'data' => $input]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid action']);
        break;
}

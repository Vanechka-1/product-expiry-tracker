const translations = {
    uk: {
        title: 'Відстежувач терміну придатності товарів',
        addProductTitle: 'Додати товар',
        productsListTitle: 'Усі товари',
        expiredTitle: 'Прострочені товари',
        productNameLabel: 'Назва товару:',
        expiryDateLabel: 'Дата прострочення:',
        emailLabel: 'Email для повідомлень:',
        addBtn: 'Додати товар',
        noProductsMsg: 'Товари ще не додані',
        footer: '© 2024 Відстежувач терміну придатності. Усі права захищені.',
        statusOk: 'Дійсний',
        statusExpiring: 'Закінчується за',
        statusExpired: 'Прострочено на',
        daysLeft: 'дні(в)',
        day: 'день',
        days: 'дні',
        successMessage: 'Товар успішно додано!',
        errorMessage: 'Помилка при додаванні товару!',
        deleteConfirm: 'Ви впевнені, що хочете видалити цей товар?',
        delete: 'Видалити',
        edit: 'Редагувати'
    },
    de: {
        title: 'Verfallsdatum-Tracker für Produkte',
        addProductTitle: 'Produkt hinzufügen',
        productsListTitle: 'Alle Produkte',
        expiredTitle: 'Abgelaufene Produkte',
        productNameLabel: 'Produktname:',
        expiryDateLabel: 'Verfallsdatum:',
        emailLabel: 'E-Mail für Benachrichtigungen:',
        addBtn: 'Produkt hinzufügen',
        noProductsMsg: 'Noch keine Produkte hinzugefügt',
        footer: '© 2024 Verfallsdatum-Tracker für Produkte. Alle Rechte vorbehalten.',
        statusOk: 'Gültig',
        statusExpiring: 'Verfällt in',
        statusExpired: 'Abgelaufen vor',
        daysLeft: 'Tagen',
        day: 'Tag',
        days: 'Tage',
        successMessage: 'Produkt erfolgreich hinzugefügt!',
        errorMessage: 'Fehler beim Hinzufügen des Produkts!',
        deleteConfirm: 'Sind Sie sicher, dass Sie dieses Produkt löschen möchten?',
        delete: 'Löschen',
        edit: 'Bearbeiten'
    }
};

function getTranslation(key) {
    const currentLang = localStorage.getItem('language') || 'uk';
    return translations[currentLang][key] || translations['uk'][key];
}
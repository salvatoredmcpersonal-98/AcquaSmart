# AcquaSmart - Database Schema

Here is the proposed database schema structure for the AcquaSmart application.

---

### `Users`

Stores user account information, authentication details, and trial status.

```sql
CREATE TABLE Users (
    user_id TEXT PRIMARY KEY, -- UUID or from Auth Provider
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Only for email/password auth
    auth_provider TEXT NOT NULL, -- 'email', 'google', 'apple'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_id TEXT,
    FOREIGN KEY (subscription_id) REFERENCES Subscriptions(subscription_id)
);
```

---

### `Subscriptions`

Manages user subscriptions and their status.

```sql
CREATE TABLE Subscriptions (
    subscription_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    provider TEXT, -- 'stripe', 'apple_iap', 'google_play'
    provider_subscription_id TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

---

### `Tanks`

Stores information about each aquarium a user manages.

```sql
CREATE TABLE Tanks (
    tank_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    volume_liters INTEGER NOT NULL,
    type TEXT, -- 'freshwater', 'saltwater', 'brackish'
    started_at DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

---

### `Parameters`

Logs the chemical and physical parameters for each tank over time.

```sql
CREATE TABLE Parameters (
    parameter_id TEXT PRIMARY KEY,
    tank_id TEXT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ph REAL,
    nitrate REAL, -- NO3
    nitrite REAL, -- NO2
    ammonia REAL, -- NH3/NH4
    kh REAL, -- Carbonate Hardness
    gh REAL, -- General Hardness
    temperature_celsius REAL,
    notes TEXT,
    FOREIGN KEY (tank_id) REFERENCES Tanks(tank_id)
);
```

---

### `Inventory`

Tracks the live stock (fish, plants, etc.) and their value.

```sql
CREATE TABLE Inventory (
    inventory_id TEXT PRIMARY KEY,
    tank_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    species TEXT,
    type TEXT NOT NULL, -- 'fish', 'plant', 'invert'
    quantity INTEGER NOT NULL,
    purchase_price REAL,
    purchase_date DATE,
    notes TEXT,
    FOREIGN KEY (tank_id) REFERENCES Tanks(tank_id)
);
```

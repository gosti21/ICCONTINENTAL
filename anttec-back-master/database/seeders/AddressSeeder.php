<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Country;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $country = Country::firstOrCreate([
            'name' => 'Peru',
            'iso_code' => 'PE',
        ]);

        $departament = $country->departaments()->firstOrCreate([
            'name' => 'Junin',
        ]);

        $province = $departament->provinces()->firstOrCreate(
            ['name' => 'Huancayo'],
        );

        $district = $province->districts()->firstOrCreate([
            'name' => 'Huancayo',
        ]);

        $district->shippingRate()->create([
            'delivery_price' => 0,
            'min_delivery_days' => 0,
            'max_delivery_days' => 1,
        ]);

      $branch = Branch::findOrFail(1);

        if ($branch->address === null) {
            $branch->address()->create([
                'favorite' => true,
                'street' => 'Av. Giráldez NRO. 274 INT. T-2',
                'street_number' => 3202,
                'reference' => 'Centro de Negocios Giráldez',
                'district_id' => $district->id,
            ]);
        }
    }
}
# 0.2.0 - 2020/03/27
* Added (`upg::`) `sg20`, `cu9`, `ab3`, (`asc::`) `sg1`, `ab1`, and `ep1`
* Added ascension
* Added option to change the precision of numbers

# 0.1.7 - 2020/03/25
* Added `sg17`, `sg18`, `cu7`, `sg19`, and `cu8`
* Added toggling auto buyers
* Added integrated changelog
* Fixed percentage display of strengths of upgrades being logically wrong
* Fixed being unable to buy anything if auto buyers are enabled and the number is extremely high, resulting currency and cost becoming always equal because of imprecision and instantly setting the currency to 0 by instead diving by twice the MAX_SAFE_INTEGER.
* Fixed very slow scaling results in practically infinite loop
* Disabled subtraction of currency when the amount to too small compared to amount bought
* Fixed some bugs with buy max

# 0.1.6 - 2020/03/24
* Added `sg14`, `sg15`, `sg16`, and `cu6`
* Added export/import save

# 0.1.5 - 2020/03/23
* Fixed number formatting
* Fixed `NaN` currency per second

# 0.1.4 - 2020/03/23
* Added `sg12`, `ab2`, `sg13`, `cu4`, and `cu5`
* Reduced number of digits displayed

# 0.1.3 - 2020/03/22
* Added `cu2`, `sg8`, `sg9`, `sg10`, `cu3`, and `sg11`

# 0.1.2 - 2020/03/21
* Added `sg7`
* Fixed 0.1.1 changelog being wrong on several places
* Removed unnecessary variable from double exponential formula
* Slightly better offline progression

# 0.1.1 - 2020/03/20
* Bug fixes and optimizations
* Changed `sg5` to affect from `sg4` to `sg3`
* Added `sg6` and `ab1`
* Fixed inaccurate cost formula for very large amount

# 0.1.0 - 2020/03/18
* Named each upgrade
* Added upgrades `sg2`, `sg3`, `sg4`, `cu1`, and `sg5`.

# 0.0.0 - 2020/03/17
* Yes